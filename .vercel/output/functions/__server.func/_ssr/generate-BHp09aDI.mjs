import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { n as STYLE_LABEL } from "./studio-BsMESzDd.mjs";
import { a as object, i as number, n as array, o as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/generate-BHp09aDI.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var generateInput = object({
	mode: _enum(["image", "video"]),
	sourceType: _enum([
		"idea",
		"image",
		"video"
	]),
	idea: string().max(4e3),
	sceneCount: number().int().min(1).max(10),
	style: string().max(64),
	aspectRatio: string().max(16),
	extraDetails: string().max(2e3).optional(),
	images: array(string().max(12e5)).max(4),
	previousTitle: string().max(255).optional(),
	previousLogline: string().max(800).optional(),
	previousLastScenes: string().max(4e3).optional()
});
var SCENE_JSON_SCHEMA = {
	name: "scene_bundle",
	strict: true,
	schema: {
		type: "object",
		additionalProperties: false,
		required: [
			"title",
			"logline",
			"scenes"
		],
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
						"continuityNote"
					],
					properties: {
						scene: { type: "integer" },
						titleTh: { type: "string" },
						descriptionTh: { type: "string" },
						promptEn: { type: "string" },
						promptTh: { type: "string" },
						continuityNote: { type: "string" }
					}
				}
			}
		}
	}
};
function buildSystemPrompt(input) {
	const styleEn = STYLE_LABEL[input.style] ?? input.style;
	const n = input.sceneCount;
	const isVideo = input.mode === "video";
	const identity = `คุณคือ "ผู้กำกับพร้อมต์" (Prompt Director) ระดับมืออาชีพ เชี่ยวชาญการเขียนพร้อมต์สำหรับ AI สร้างภาพและวิดีโอ เช่น Grok Imagine, Kling, Runway, Veo, Midjourney, Seedance

หน้าที่: แปลงสื่อต้นทาง (ไอเดีย / รูป / คลิป) ให้เป็นชุดพร้อมต์ ${n} ฉาก ที่ต่อเนื่องกันเหมือนสตอรี่บอร์ดภาพยนตร์ — ผู้ใช้จะนำไปวางในแชท AI เพื่อสร้างทีละฉาก

กฎเหล็ก:
- สไตล์ภาพรวมทุกฉาก: ${styleEn}
- อัตราส่วนภาพ: ${input.aspectRatio}
- ตัวละคร ยานพาหนะ โลโก้ ชุดสี แสง และบรรยากาศหลัก ต้อง "ล็อกตัวตน" — เขียนคำอธิบายเอกลักษณ์ซ้ำใน promptEn ของทุกฉากด้วยถ้อยคำเดิม (เช่น ยี่ห้อรถ สี โลโก้ ป้ายทะเบียน ใบหน้า เครื่องแบบ) เพื่อให้ภาพ/คลิปชุดเดียวกันต่อกันได้
- promptEn: ภาษาอังกฤษ ละเอียด 60–130 คำ ครอบคลุม องค์ประกอบ แสง มุมกล้อง เลนส์ อารมณ์ คุณภาพ (cinematic, 8k, photoreal where relevant) และการเคลื่อนไหว (ถ้าเป็นวิดีโอ)
- promptTh: ภาษาไทย เป็น "คำสั่งวางในแชทได้ทันที" น้ำเสียงสุภาพแบบผู้ใช้ไทย
- titleTh / descriptionTh / continuityNote / logline เป็นภาษาไทย
- logline: สรุปทั้งชุด 1 ประโยค
- title: ชื่อเรื่องสั้นทรงพลัง (ไทยได้)
- เรื่องต้องเดินไปข้างหน้าทุกฉาก มีจังหวะ ตึง–คลาย หรือเซอร์ไพรส์เล็กน้อย ไม่ย่ำอยู่กับที่
- อย่าใส่คำว่า "AI generated" หรือ meta instruction ใน promptEn`;
	if (isVideo) return `${identity}

โหมดวิดีโอ — ผู้ใช้สร้างคลิปทีละตอน แล้วส่งคลิปที่ได้กลับไปเพื่อให้ AI สร้างคลิปถัดไป (คลิปใหม่มักยาวขึ้นและรวมคลิปก่อนหน้าไว้ด้วย เช่น 10 วินาที → 20 วินาที)

รูปแบบคำสั่งไทยที่ต้องใช้เป๊ะ:
- ถ้าฉากนี้เริ่มจากรูปภาพต้นฉบับ: promptTh ขึ้นต้นด้วย
  "จากรูปภาพนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการ ให้หน่อยครับ." ตามด้วยทิศทางฉากนั้น 2–4 ประโยค
- ถ้าฉากนี้ต่อจากคลิปก่อนหน้า: promptTh ขึ้นต้นด้วย
  "จากคลิปวีดีโอนี้ ช่วยสร้างวีดีโอต่อเนื่องตามจินตนาการ ให้หน่อยครับ." ตามด้วยเหตุการณ์ใหม่ที่เกิดต่อจากเฟรมสุดท้าย

promptEn ของทุกฉากต้องบอกชัด:
- "continue seamlessly from the last frame of the previous clip" (ยกเว้นฉาก 1 ที่เริ่มจากภาพนิ่ง — ใช้ image-to-video: เริ่มจากภาพนี้ แล้วค่อยขยับ)
- camera move, weather, vehicle/character action, sound/dialogue ถ้ามี
- สิ่งที่ต้องคงเดิม (identity lock)
- ความยาวคลิปเป้าหมายประมาณ 8–10 วินาทีต่อฉาก

continuityNote: อธิบายสั้นๆ ว่าฉากนี้ต่อจากฉากก่อนอย่างไร และผู้ใช้ควรแนบสื่ออะไร (รูปต้นฉบับ หรือคลิปฉากที่เพิ่งสร้าง)

ถ้ามีเฟรมจากคลิปที่อัปโหลดมา: ฉาก 1 ต้องต่อจากเฟรมสุดท้ายของคลิปนั้น ห้ามเล่าย้อน
ถ้ามีรูปต้นฉบับ: ฉาก 1 คือภาพนั้นมีชีวิตขึ้นมา`;
	return `${identity}

โหมดรูปภาพ — สตอรี่บอร์ดภาพนิ่งทีละใบ
- promptTh ฉากแรกขึ้นต้น "ช่วยสร้างรูปภาพตามจินตนาการ ให้หน่อยครับ." (ถ้ามีรูปต้นฉบับ ให้ขึ้นต้น "จากรูปภาพนี้ ช่วยสร้างรูปภาพต่อเนื่องตามจินตนาการ ให้หน่อยครับ.")
- ฉากถัดไปขึ้นต้น "ช่วยสร้างรูปภาพต่อเนื่องจากภาพก่อนหน้า ให้หน่อยครับ."
- promptEn เป็น text-to-image ที่สมบูรณ์ในตัว (สร้างแยกใบได้) พร้อม identity lock
- มุมกล้องหลากหลาย: wide, close-up, low angle, over-shoulder, aerial ตามจังหวะเรื่อง
- continuityNote: ความสัมพันธ์กับภาพก่อนหน้า`;
}
function buildUserText(input) {
	const parts = [];
	const hasImages = input.images.length > 0;
	if (input.sourceType === "image" && hasImages) parts.push("ผู้ใช้อัปโหลดรูปภาพต้นฉบับ (ดูในภาพที่แนบ) — วิเคราะห์องค์ประกอบทั้งหมด: ตัวละคร ยานพาหนะ โลโก้ ป้าย เสื้อผ้า สภาพอากาศ แสง สี มุมกล้อง แล้วใช้เป็นจุดเริ่มของทั้งเรื่อง");
	if (input.sourceType === "video" && hasImages) parts.push(`ผู้ใช้อัปโหลดคลิปวิดีโอต้นทาง มีเฟรมสกัดมา ${input.images.length} ใบ (ต้นเรื่อง / กลาง / เกือบท้าย) — เฟรมสุดท้ายคือจุดที่เรื่องต้องต่อ วิเคราะห์การเคลื่อนไหวโดยนัยจากลำดับเฟรม ตัวละคร โลโก้ บรรยากาศ แล้วออกแบบ ${input.sceneCount} ฉากถัดไปโดยไม่ย้อนกลับไปเล่าซ้ำ`);
	if (input.previousTitle || input.previousLastScenes) {
		parts.push("บริบทเรื่องที่สร้างไว้ก่อนหน้า (ต้องต่อไม่ซ้ำ):");
		if (input.previousTitle) parts.push(`ชื่อเรื่องเดิม: ${input.previousTitle}`);
		if (input.previousLogline) parts.push(`เรื่องย่อเดิม: ${input.previousLogline}`);
		if (input.previousLastScenes) parts.push(`ฉากล่าสุด:\n${input.previousLastScenes}`);
	}
	const idea = input.idea.trim();
	if (idea) parts.push(`ไอเดีย / ทิศทางจากผู้ใช้:\n"""${idea}"""`);
	else if (!hasImages) parts.push("ผู้ใช้ไม่ได้ระบุไอเดียเป็นข้อความ — จงจินตนาการเรื่องราวซีนีมาติกที่เข้มข้นจากสื่อที่แนบ หรือจากโทนการเดินทางฝ่าอุปสรรคเพื่อส่งของให้ทัน");
	else parts.push("ผู้ใช้ต้องการให้จินตนาการเรื่องต่อเนื่องจากสื่อที่แนบเอง อย่างเป็นธรรมชาติ น่าติดตาม");
	if (input.extraDetails?.trim()) parts.push(`รายละเอียดเพิ่มเติม:\n"""${input.extraDetails.trim()}"""`);
	parts.push(`จงออกแบบพร้อมต์ทั้งหมด ${input.sceneCount} ฉาก โหมด ${input.mode === "video" ? "วิดีโอ" : "รูปภาพ"} ตอบเป็น JSON ตาม schema เท่านั้น ฉากต้องครบ ${input.sceneCount} ฉาก เรียง scene เป็น 1..${input.sceneCount}`);
	return parts.join("\n\n");
}
function mapStatusError(status, detail) {
	if (status === 401) return "ระบบ AI ยังไม่พร้อมในสภาพแวดล้อมนี้";
	if (status === 402 || status === 403) return "โควต้าการใช้งาน AI เต็มแล้ว กรุณาลองใหม่ภายหลัง";
	if (status === 429) return "เรียกใช้งานหนาแน่นเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง";
	if (status === 400) return detail.slice(0, 240) || "คำขอไม่ถูกต้อง กรุณาปรับรายละเอียดแล้วลองใหม่";
	if (status >= 500) return "ระบบ AI ขัดข้องชั่วคราว กรุณาลองอีกครั้ง";
	return detail.slice(0, 240) || `เรียก AI ไม่สำเร็จ (${status})`;
}
function parseBundle(raw, sceneCount) {
	let text = raw.trim();
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced?.[1]) text = fenced[1].trim();
	const parsed = JSON.parse(text);
	if (!parsed || !Array.isArray(parsed.scenes)) throw new Error("รูปแบบผลลัพธ์ไม่ถูกต้อง");
	const scenes = parsed.scenes.slice(0, sceneCount).map((s, i) => ({
		scene: i + 1,
		titleTh: String(s.titleTh ?? `ฉาก ${i + 1}`),
		descriptionTh: String(s.descriptionTh ?? ""),
		promptEn: String(s.promptEn ?? ""),
		promptTh: String(s.promptTh ?? ""),
		continuityNote: String(s.continuityNote ?? "")
	}));
	if (scenes.length === 0) throw new Error("AI ไม่ได้ส่งฉากกลับมา");
	return {
		title: String(parsed.title ?? "เรื่องไม่มีชื่อ").slice(0, 120),
		logline: String(parsed.logline ?? "").slice(0, 400),
		scenes
	};
}
var getAiStatus_createServerFn_handler = createServerRpc({
	id: "6354698b79df99bfbb6558aa409dec853a4525a110efb456c8100c8f678b63e2",
	name: "getAiStatus",
	filename: "src/lib/generate.ts"
}, (opts) => getAiStatus.__executeServer(opts));
var getAiStatus = createServerFn({ method: "GET" }).handler(getAiStatus_createServerFn_handler, async () => {
	return { available: Boolean(process.env.XAI_API_KEY) };
});
var generateScenes_createServerFn_handler = createServerRpc({
	id: "00840363be04256a0a62cfc2d5e6a7b2ad29d89d6eda7fa75ac855858f6cdcb1",
	name: "generateScenes",
	filename: "src/lib/generate.ts"
}, (opts) => generateScenes.__executeServer(opts));
var generateScenes = createServerFn({ method: "POST" }).validator((data) => generateInput.parse(data)).handler(generateScenes_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "ระบบ AI ยังไม่พร้อมในสภาพแวดล้อมนี้"
	};
	const userContent = [{
		type: "text",
		text: buildUserText(data)
	}, ...data.images.map((url) => ({
		type: "image_url",
		image_url: { url }
	}))];
	const body = {
		model: "grok-4.5",
		temperature: .85,
		max_tokens: 8192,
		messages: [{
			role: "system",
			content: buildSystemPrompt(data)
		}, {
			role: "user",
			content: userContent
		}],
		response_format: {
			type: "json_schema",
			json_schema: SCENE_JSON_SCHEMA
		}
	};
	async function postChat(payload) {
		return fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify(payload)
		});
	}
	let res;
	try {
		res = await postChat(body);
		if (res.status === 400) {
			const cloneText = await res.text();
			res = await postChat({
				...body,
				response_format: { type: "json_object" }
			});
			if (!res.ok && res.status === 400) return {
				ok: false,
				error: mapStatusError(400, cloneText.slice(0, 240))
			};
		}
	} catch {
		return {
			ok: false,
			error: "เชื่อมต่อระบบ AI ไม่สำเร็จ กรุณาลองอีกครั้ง"
		};
	}
	const rawText = await res.text();
	if (!res.ok) {
		let detail = "";
		try {
			const errJson = JSON.parse(rawText);
			detail = errJson.error?.message ?? errJson.message ?? "";
		} catch {
			detail = rawText.slice(0, 240);
		}
		return {
			ok: false,
			error: mapStatusError(res.status, detail)
		};
	}
	let content = "";
	try {
		content = JSON.parse(rawText).choices?.[0]?.message?.content ?? "";
	} catch {
		return {
			ok: false,
			error: "อ่านผลลัพธ์จาก AI ไม่สำเร็จ"
		};
	}
	if (!content) return {
		ok: false,
		error: "AI ไม่ได้ส่งข้อความกลับมา"
	};
	try {
		return {
			ok: true,
			bundle: parseBundle(content, data.sceneCount)
		};
	} catch {
		return {
			ok: false,
			error: "ถอดชุดพร้อมต์ไม่สำเร็จ กรุณากดออกแบบอีกครั้ง"
		};
	}
});
//#endregion
export { generateScenes_createServerFn_handler, getAiStatus_createServerFn_handler };
