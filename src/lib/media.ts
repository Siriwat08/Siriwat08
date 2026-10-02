const MAX_EDGE = 768;
const JPEG_QUALITY = 0.74;

function canvasToJpeg(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถประมวลผลภาพได้");
  ctx.drawImage(source, 0, 0, w, h);
  return canvasToJpeg(canvas);
}

export function fileToResizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        resolve(drawToCanvas(img, img.naturalWidth, img.naturalHeight));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ไฟล์รูปภาพไม่ถูกต้อง"));
    };
    img.src = url;
  });
}

export function dataUrlFromRemote(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        resolve(drawToCanvas(img, img.naturalWidth, img.naturalHeight));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("โหลดรูปตัวอย่างไม่สำเร็จ"));
    img.src = src;
  });
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      reject(new Error("เลื่อนคลิปไม่สำเร็จ"));
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    video.currentTime = time;
  });
}

export async function extractVideoFrames(file: File): Promise<{
  frames: string[];
  durationSec: number;
}> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onErr);
        resolve();
      };
      const onErr = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onErr);
        reject(new Error("อ่านคลิปวิดีโอไม่สำเร็จ"));
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", onErr);
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const times =
      duration > 1.2
        ? [0.04 * duration, 0.5 * duration, Math.max(0, duration - 0.12)]
        : [0];

    const frames: string[] = [];
    for (const t of times) {
      await seekVideo(video, Math.max(0, t));
      frames.push(
        drawToCanvas(video, video.videoWidth || 1280, video.videoHeight || 720),
      );
    }
    return { frames, durationSec: duration };
  } finally {
    video.src = "";
    URL.revokeObjectURL(url);
  }
}
