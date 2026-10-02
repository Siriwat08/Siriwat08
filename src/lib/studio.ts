export type GenerationMode = "image" | "video";
export type SourceType = "idea" | "image" | "video";

export interface ScenePrompt {
  scene: number;
  titleTh: string;
  descriptionTh: string;
  promptEn: string;
  promptTh: string;
  continuityNote: string;
}

export interface SceneBundle {
  title: string;
  logline: string;
  scenes: ScenePrompt[];
}

export interface GenerateInput {
  mode: GenerationMode;
  sourceType: SourceType;
  idea: string;
  sceneCount: number;
  style: string;
  aspectRatio: string;
  extraDetails?: string;
  /** JPEG data URLs of the reference image and/or extracted video frames */
  images: string[];
  previousTitle?: string;
  previousLogline?: string;
  previousLastScenes?: string;
}

export interface HistoryItem extends SceneBundle {
  id: string;
  createdAt: number;
  mode: GenerationMode;
  sourceType: SourceType;
  idea: string;
  style: string;
  aspectRatio: string;
  sceneCount: number;
  thumbDataUrl?: string;
}

export const STYLE_OPTIONS = [
  { value: "cinematic", label: "ซีนีมาติกสมจริง" },
  { value: "documentary", label: "สารคดี / ภาพจริง" },
  { value: "anime", label: "อนิเมะญี่ปุ่น" },
  { value: "cartoon3d", label: "การ์ตูน 3D" },
  { value: "fantasy", label: "แฟนตาซี" },
  { value: "retro-film", label: "ฟิล์มย้อนยุค" },
  { value: "cyberpunk", label: "ไซเบอร์พังก์" },
  { value: "watercolor", label: "สีน้ำศิลปะ" },
] as const;

export const ASPECT_OPTIONS = [
  { value: "16:9", label: "16:9 แนวนอน" },
  { value: "9:16", label: "9:16 แนวตั้ง" },
  { value: "1:1", label: "1:1 จัตุรัส" },
  { value: "4:3", label: "4:3 คลาสสิก" },
] as const;

export const STYLE_LABEL: Record<string, string> = {
  cinematic: "cinematic photorealistic, dramatic film lighting, wet reflections",
  documentary: "documentary realism, natural light, handheld observational feel",
  anime: "Japanese anime style, detailed background art, film still quality",
  cartoon3d: "3D animated movie style, Pixar-like rendering, rich materials",
  fantasy: "epic fantasy, magical atmosphere, rich tactile detail",
  "retro-film": "retro film look, analog grain, vintage color grading",
  cyberpunk: "cyberpunk neon, high contrast, rain-slick futuristic city",
  watercolor: "watercolor painting, soft artistic strokes, paper texture",
};

export function formatScenesForContinue(scenes: ScenePrompt[]): string {
  return scenes
    .slice(-4)
    .map(
      (s) =>
        `ฉาก ${s.scene} — ${s.titleTh}: ${s.descriptionTh}${s.continuityNote ? ` (ต่อเนื่องจาก: ${s.continuityNote})` : ""}`,
    )
    .join("\n");
}

export function bundleToPlainText(bundle: SceneBundle): string {
  const body = bundle.scenes
    .map(
      (s) =>
        `===== SCENE ${String(s.scene).padStart(2, "0")} — ${s.titleTh} =====\n${s.descriptionTh}\n\n[EN PROMPT]\n${s.promptEn}\n\n[TH คำสั่ง]\n${s.promptTh}\n\n[ความต่อเนื่อง]\n${s.continuityNote}`,
    )
    .join("\n\n\n");
  return `${bundle.title}\n${bundle.logline}\n\n${body}`;
}
