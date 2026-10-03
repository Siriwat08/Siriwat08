import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createChatCompletion,
  LlmEmpty,
  LlmHttpError,
  LlmMisconfigured,
  resolveProvider,
} from "@/lib/llm-client";
import { STYLE_LABEL, type SceneBundle, type ScenePrompt } from "@/lib/studio";

const generateInput = z.object({
  mode: z.enum(["image", "video"]),
  sourceType: z.enum(["idea", "image", "video"]),
  idea: z.string().max(4000),
  sceneCount: z.number().int().min(1).max(10),
  style: z.string().max(64),
  aspectRatio: z.string().max(16),
  extraDetails: z.string().max(2000).optional(),
  images: z.array(z.string().max(1_200_000)).max(4),
  previousTitle: z.string().max(255).optional(),
  previousLogline: z.string().max(800).optional(),
  previousLastScenes: z.string().max(4000).optional(),
});

export type GenerateOk = { ok: true; bundle: SceneBundle };
export type GenerateFail = { ok: false; error: string };
export type GenerateResult = GenerateOk | GenerateFail;

const SCENE_JSON_SCHEMA = {
  name: "scene_bundle",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["title", "logline", "scenes"],
    properties: {
      title: { type: "string" },
      logline: { type: "string" },
      scenes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "scene",
            "titleTh",
            "descriptionTh",
            "promptEn",
            "promptTh",
            "continuityNote",
          ],
          properties: {
            scene: { type: "integer" },
            titleTh: { type: "string" },
            descriptionTh: { type: "string" },
            promptEn: { type: "string" },
            promptTh: { type: "string" },
            continuityNote: { type: "string" },
          },
        },
      },
    },
  },
} as const;

function buildSystemPrompt(input: z.infer<typeof generateInput>): string {
  const n = input.sceneCount;
  const isVideo = input.mode === "video";
  const hasSourceMedia = input.images.length > 0;

  const styleRule =
    input.style === "auto"
      ? hasSourceMedia
        ? "สไตล์ภาพรวมทุกฉาก: ล็อกสไตล์ให้แม่นยำตามสื่อต้นทางที่แนบมา — วิเคราะห์จากรูป/เฟรมที่แนบแล้วระบุให้ชัดว่าเป็นวัสดุ/เทคนิคแบบใด (เช่น ก้อนดินเหนียว claymation, อนิเมะวาดมือ, โมเดลจิ๋ว, ภาพถ่ายสินค้า, ฟิล์มเก่า) รวมถึงพาเลตสี แสง เท็กซ์เจอร์ และลักษณะโลโก้/ป้ายชื่อ/ตัวอักษรบนสื่อ (สะกดข้อความบนป้ายตามต้นฉบับเป๊ะ) จากนั้นบรรยายสไตล์นั้นด้วยถ้อยคำเดิมซ้ำใน promptEn ของทุกฉาก — ห้ามเปลี่ยนไปใช้สไตล์อื่น"
        : "สไตล์ภาพรวมทุกฉาก: ผู้ใช้เลือกโหมดอัตโนมัติแต่ไม่มีสื่อต้นทาง — จงเลือกสไตล์ที่เหมาะกับเรื่องนี้ที่สุดเอง แล้วบรรยายสไตล์ที่เลือกด้วยถ้อยคำเดิมซ้ำใน promptEn ของทุกฉาก"
      : `สไตล์ภาพรวมทุกฉาก: ${STYLE_LABEL[input.style] ?? input.style}`;

  const identity = `คุณคือ "ผู้กำกับพร้อมต์" (Prompt Director) ระดับมืออาชีพ เชี่ยวชาญการเขียนพร้อมต์สำหรับ AI สร้างภาพและวิดีโอ เช่น Grok Imagine, Kling, Runway, Veo, Midjourney, Seedance

หน้าที่: แปลงสื่อต้นทาง (ไอเดีย / รูป / คลิป) ให้เป็นชุดพร้อมต์ ${n} ฉาก ที่ต่อเนื่องกันเหมือนสตอรี่บอร์ดภาพยนตร์ — ผู้ใช้จะนำไปวางในแชท AI เพื่อสร้างทีละฉาก

กฎเหล็ก:
- ${styleRule}
- อัตราส่วนภาพ: ${input.aspectRatio}
- ตัวละคร ยานพาหนะ โลโก้ ชุดสี แสง และบรรยากาศหลัก ต้อง "ล็อกตัวตน" — เขียนคำอธิบายเอกลักษณ์ซ้ำใน promptEn ของทุกฉากด้วยถ้อยคำเดิม (เช่น ยี่ห้อรถ สี โลโก้ ป้ายทะเบียน ใบหน้า เครื่องแบบ) เพื่อให้ภาพ/คลิปชุดเดียวกันต่อกันได้
- promptEn: ภาษาอังกฤษ ละเอียด 60–130 คำ ครอบคลุม องค์ประกอบ แสง มุมกล้อง เลนส์ อารมณ์ คุณภาพ (cinematic, 8k, photoreal where relevant) — ส่วนการเคลื่อนไหว/คลิปให้พูดถึงเฉพาะโหมดวิดีโอเท่านั้น
- promptTh: ภาษาไทย เป็น "คำสั่งวางในแชทได้ทันที" น้ำเสียงสุภาพแบบผู้ใช้ไทย
- titleTh / descriptionTh / continuityNote / logline เป็นภาษาไทย
- logline: สรุปทั้งชุด 1 ประโยค
- title: ชื่อเรื่องสั้นทรงพลัง (ไทยได้)
- เรื่องต้องเดินไปข้างหน้าทุกฉาก มีจังหวะ ตึง–คลาย หรือเซอร์ไพรส์เล็กน้อย ไม่ย่ำอยู่กับที่
- อย่าใส่คำว่า "AI generated" หรือ meta instruction ใน promptEn`;

  if (isVideo) {
    return `${identity}

โหมดวิดีโอ — ผู้ใช้สร้างคลิปทีละตอน แล้วส่งคลิปที่ได้กลับไปเพื่อให้ AI สร้างคลิปถัดไป (คลิปใหม่ยาวขึ้นและ "รวมคลิปก่อนหน้าไว้ตอนต้น" เช่น 10 วินาที → 20 วินาที)

รูปแบบคำสั่งไทยที่ต้องใช้เป๊ะ:
- ถ้าฉากนี้เริ่มจากรูปภาพต้นฉบับ: promptTh ขึ้นต้นด้วย
  "จากรูปภาพนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการให้หน่อยครับ." ตามด้วยทิศทางฉากนั้น 2–4 ประโยค
- ถ้าฉากนี้ต่อจากคลิปก่อนหน้า: promptTh ขึ้นต้นด้วย
  "จากคลิปวีดีโอนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการให้หน่อยครับ." ตามด้วยเหตุการณ์ใหม่ที่เกิดต่อจากเฟรมสุดท้าย

promptEn ของทุกฉากต้องบอกชัด (ทุกฉากเป็นวิดีโอ — ต้องมีการเคลื่อนไหวของกล้องและ/หรือตัวละครทุกฉาก):
- "continue seamlessly from the last frame of the previous clip" (ยกเว้นฉาก 1 ที่เริ่มจากภาพนิ่ง — ใช้ image-to-video: เริ่มจากภาพนี้ แล้วค่อยขยับ)
- สำหรับฉากต่อเนื่อง: ระบุว่าผลลัพธ์ควรเป็น "one continuous ~20 second video that includes the previous clip at the start, then extends it"
- camera move, weather, vehicle/character action, sound/dialogue ถ้ามี
- สิ่งที่ต้องคงเดิม (identity lock)
- ความยาวคลิปเป้าหมายประมาณ 8–10 วินาทีต่อฉาก (ยกเว้นตอนรวมคลิปเดิม อาจยาวถึง ~20 วินาที)

continuityNote: อธิบายสั้นๆ ว่าฉากนี้ต่อจากฉากก่อนอย่างไร และผู้ใช้ควรแนบสื่ออะไร (รูปต้นฉบับ หรือคลิปฉากที่เพิ่งสร้าง)

ถ้ามีเฟรมจากคลิปที่อัปโหลดมา: ฉาก 1 ต้องต่อจากเฟรมสุดท้ายของคลิปนั้น ห้ามเล่าย้อน
ถ้ามีรูปต้นฉบับ: ฉาก 1 คือภาพนั้นมีชีวิตขึ้นมา`;
  }

  return `${identity}

โหมดรูปภาพ — สตอรี่บอร์ดภาพนิ่งทีละใบ
- ทุกฉากคือ "ภาพนิ่งเฟรมเดียว" (single still frame) ไม่ใช่คลิป — อธิบายเหมือนถ่ายภาพนิ่งด้วยชัตเตอร์ความเร็วสูง
- ห้ามใส่ใน promptEn และ promptTh เด็ดขาด:
  • การเคลื่อนที่ของกล้อง เช่น camera pan / zoom / dolly / tracking / orbit / push in / pull back / handheld follow
  • การเล่าต่อเนื่องเป็นเวลา เช่น then, as it moves, gradually, starts to, begins to, while driving
  • ความยาวคลิป (วินาที) เสียง คำบรรยายเสียง หรือคำว่า video / clip
- ถ้าฉากมีแอ็กชัน ให้เลือก "จังหวะหยุดนิ่งกลางแอ็กชัน" มา 1 ช่วง (frozen moment เช่น น้ำกระเซ็นกลางอากาศ ล้อพรมฝุ่น เส้นผมปลิว) แล้วบรรยายเป็นภาพนิ่งของช่วงเวลานั้น
- เล่าการเดินเรื่องใส่ descriptionTh / continuityNote เท่านั้น ห้ามยัดลำดับเหตุการณ์ลงใน prompt
- promptTh ฉากแรกขึ้นต้น "ช่วยสร้างรูปภาพตามจินตนาการให้หน่อยครับ." (ถ้ามีรูปต้นฉบับ ให้ขึ้นต้น "จากรูปภาพนี้ ช่วยสร้างรูปภาพต่อเนื่องตามจินตนาการให้หน่อยครับ.")
- ฉากถัดไปขึ้นต้น "ช่วยสร้างรูปภาพต่อเนื่องจากภาพก่อนหน้าให้หน่อยครับ."
- promptEn เป็น text-to-image ที่สมบูรณ์ในตัว (สร้างแยกใบได้) พร้อม identity lock
- มุมกล้องหลากหลาย: wide, close-up, low angle, over-shoulder, aerial ตามจังหวะเรื่อง (มุมกล้อง = จุดยืนของกล้องนิ่งๆ ไม่ใช่การเคลื่อนกล้อง)
- continuityNote: ความสัมพันธ์กับภาพก่อนหน้า`;
}

function buildUserText(input: z.infer<typeof generateInput>): string {
  const parts: string[] = [];
  const hasImages = input.images.length > 0;

  if (input.sourceType === "image" && hasImages) {
    parts.push(
      "ผู้ใช้อัปโหลดรูปภาพต้นฉบับ (ดูในภาพที่แนบ) — วิเคราะห์องค์ประกอบทั้งหมด: ตัวละคร ยานพาหนะ โลโก้ ป้าย เสื้อผ้า สภาพอากาศ แสง สี มุมกล้อง แล้วใช้เป็นจุดเริ่มของทั้งเรื่อง",
    );
  }
  if (input.sourceType === "video" && hasImages) {
    parts.push(
      `ผู้ใช้อัปโหลดคลิปวิดีโอต้นทาง มีเฟรมสกัดมา ${input.images.length} ใบ (ต้นเรื่อง / กลาง / เกือบท้าย) — เฟรมสุดท้ายคือจุดที่เรื่องต้องต่อ วิเคราะห์การเคลื่อนไหวโดยนัยจากลำดับเฟรม ตัวละคร โลโก้ บรรยากาศ แล้วออกแบบ ${input.sceneCount} ฉากถัดไปโดยไม่ย้อนกลับไปเล่าซ้ำ`,
    );
  }
  if (input.previousTitle || input.previousLastScenes) {
    parts.push("บริบทเรื่องที่สร้างไว้ก่อนหน้า (ต้องต่อไม่ซ้ำ):");
    if (input.previousTitle) parts.push(`ชื่อเรื่องเดิม: ${input.previousTitle}`);
    if (input.previousLogline) parts.push(`เรื่องย่อเดิม: ${input.previousLogline}`);
    if (input.previousLastScenes) parts.push(`ฉากล่าสุด:\n${input.previousLastScenes}`);
  }

  const idea = input.idea.trim();
  if (idea) {
    parts.push(`ไอเดีย / ทิศทางจากผู้ใช้:\n"""${idea}"""`);
  } else if (!hasImages) {
    parts.push(
      "ผู้ใช้ไม่ได้ระบุไอเดียเป็นข้อความ — จงจินตนาการเรื่องราวซีนีมาติกที่เข้มข้นจากสื่อที่แนบ หรือจากโทนการเดินทางฝ่าอุปสรรคเพื่อส่งของให้ทัน",
    );
  } else {
    parts.push(
      "ผู้ใช้ต้องการให้จินตนาการเรื่องต่อเนื่องจากสื่อที่แนบเอง อย่างเป็นธรรมชาติ น่าติดตาม",
    );
  }

  if (input.extraDetails?.trim()) {
    parts.push(`รายละเอียดเพิ่มเติม:\n"""${input.extraDetails.trim()}"""`);
  }

  parts.push(
    `จงออกแบบพร้อมต์ทั้งหมด ${input.sceneCount} ฉาก โหมด ${input.mode === "video" ? "วิดีโอ" : "รูปภาพ"} ตอบเป็น JSON ตาม schema เท่านั้น ฉากต้องครบ ${input.sceneCount} ฉาก เรียง scene เป็น 1..${input.sceneCount}`,
  );
  return parts.join("\n\n");
}

function mapStatusError(status: number, detail: string): string {
  if (status === 401) return "ระบบ AI ยังไม่พร้อมในสภาพแวดล้อมนี้";
  if (status === 402 || status === 403)
    return "โควต้าการใช้งาน AI เต็มแล้ว กรุณาลองใหม่ภายหลัง";
  if (status === 429) return "เรียกใช้งานหนาแน่นเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง";
  if (status === 400)
    return detail.slice(0, 240) || "คำขอไม่ถูกต้อง กรุณาปรับรายละเอียดแล้วลองใหม่";
  if (status >= 500) return "ระบบ AI ขัดข้องชั่วคราว กรุณาลองอีกครั้ง";
  return detail.slice(0, 240) || `เรียก AI ไม่สำเร็จ (${status})`;
}

function parseBundle(raw: string, sceneCount: number): SceneBundle {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) text = fenced[1].trim();
  const parsed = JSON.parse(text) as SceneBundle;
  if (!parsed || !Array.isArray(parsed.scenes)) {
    throw new Error("รูปแบบผลลัพธ์ไม่ถูกต้อง");
  }
  const scenes: ScenePrompt[] = parsed.scenes.slice(0, sceneCount).map((s, i) => ({
    scene: i + 1,
    titleTh: String(s.titleTh ?? `ฉาก ${i + 1}`),
    descriptionTh: String(s.descriptionTh ?? ""),
    promptEn: String(s.promptEn ?? ""),
    promptTh: String(s.promptTh ?? ""),
    continuityNote: String(s.continuityNote ?? ""),
  }));
  if (scenes.length === 0) throw new Error("AI ไม่ได้ส่งฉากกลับมา");
  return {
    title: String(parsed.title ?? "เรื่องไม่มีชื่อ").slice(0, 120),
    logline: String(parsed.logline ?? "").slice(0, 400),
    scenes,
  };
}

export const getAiStatus = createServerFn({ method: "GET" }).handler(async () => {
  const provider = resolveProvider();
  return {
    available: Boolean(provider),
    provider: provider?.id ?? null,
  };
});

export const generateScenes = createServerFn({ method: "POST" })
  .validator((data: unknown) => generateInput.parse(data))
  .handler(async ({ data }): Promise<GenerateResult> => {
    if (!resolveProvider()) {
      return { ok: false, error: "ระบบ AI ยังไม่พร้อมในสภาพแวดล้อมนี้" };
    }

    type ContentPart =
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } };

    const userContent: ContentPart[] = [
      { type: "text", text: buildUserText(data) },
      ...data.images.map((url) => ({
        type: "image_url" as const,
        image_url: { url },
      })),
    ];

    const messages = [
      { role: "system" as const, content: buildSystemPrompt(data) },
      { role: "user" as const, content: userContent },
    ];

    type FormatMode = "schema" | "object" | "none";
    async function complete(mode: FormatMode) {
      return createChatCompletion(messages, {
        temperature: 0.85,
        maxTokens: 8192,
        hasImages: data.images.length > 0,
        responseFormat:
          mode === "schema"
            ? { type: "json_schema", json_schema: SCENE_JSON_SCHEMA }
            : mode === "object"
              ? { type: "json_object" }
              : undefined,
      });
    }

    let completion;
    try {
      try {
        completion = await complete("schema");
      } catch (err) {
        // Some models reject json_schema — retry with plain json_object.
        if (err instanceof LlmHttpError && err.status === 400) {
          try {
            completion = await complete("object");
          } catch (err2) {
            // Last resort: no response_format at all (prompt already
            // demands JSON; parseBundle strips code fences).
            if (err2 instanceof LlmHttpError && err2.status === 400) {
              completion = await complete("none");
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      if (err instanceof LlmMisconfigured) {
        return { ok: false, error: "ระบบ AI ยังไม่พร้อมในสภาพแวดล้อมนี้" };
      }
      if (err instanceof LlmEmpty) {
        // All candidate models replied without content (reasoning models
        // under heavy load) — tell the user to simply retry.
        return {
          ok: false,
          error:
            "โมเดล AI ตอบกลับมาเป็นค่าว่างชั่วคราว (เซิร์ฟเวอร์โหลดหนัก) กรุณากดออกแบบอีกครั้ง",
        };
      }
      if (err instanceof LlmHttpError) {
        return { ok: false, error: mapStatusError(err.status, err.detail) };
      }
      return {
        ok: false,
        error:
          err instanceof Error && err.message
            ? err.message
            : "เชื่อมต่อระบบ AI ไม่สำเร็จ กรุณาลองอีกครั้ง",
      };
    }

    try {
      const bundle = parseBundle(completion.content, data.sceneCount);
      return { ok: true, bundle };
    } catch {
      return {
        ok: false,
        error: "ถอดชุดพร้อมต์ไม่สำเร็จ กรุณากดออกแบบอีกครั้ง",
      };
    }
  });
