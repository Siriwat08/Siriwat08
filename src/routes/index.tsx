import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clapperboard,
  Copy,
  Film,
  Image as ImageIcon,
  Lightbulb,
  RefreshCcw,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SceneCard, useCopyFeedback } from "@/components/scene-card";
import { generateScenes, getAiStatus } from "@/lib/generate";
import { useHistoryStore, useHistoryHydration } from "@/lib/history-store";
import {
  dataUrlFromRemote,
  extractVideoFrames,
  fileToResizedDataUrl,
} from "@/lib/media";
import {
  ASPECT_OPTIONS,
  STYLE_OPTIONS,
  bundleToPlainText,
  formatScenesForContinue,
  type GenerationMode,
  type HistoryItem,
  type SceneBundle,
  type SourceType,
} from "@/lib/studio";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    g: typeof search.g === "string" ? search.g : undefined,
  }),
  loader: async () => getAiStatus(),
  component: StudioPage,
});

const LOADING_STEPS = [
  "กำลังอ่านสื่อและไอเดียของคุณ…",
  "กำลังวางโครงเรื่องเป็นฉากๆ…",
  "กำลังเขียนพร้อมต์แต่ละฉาก…",
  "กำลังล็อกตัวตนและความต่อเนื่อง…",
];

const SOURCE_OPTIONS: { value: SourceType; label: string; hint: string }[] = [
  { value: "idea", label: "จากไอเดีย", hint: "พิมพ์เรื่องที่จินตนาการไว้" },
  { value: "image", label: "จากรูปภาพ", hint: "อัปโหลดรูปเป็นฉากเปิด" },
  { value: "video", label: "จากคลิป", hint: "ต่อเรื่องจากคลิปที่มีอยู่" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="label-tech text-muted-foreground mb-2.5">{children}</p>;
}

function StudioPage() {
  const { g: historyId } = Route.useSearch();
  const ai = Route.useLoaderData();
  const navigate = useNavigate({ from: "/" });
  const historyGet = useHistoryStore((s) => s.get);
  const historyAdd = useHistoryStore((s) => s.add);
  const historyReady = useHistoryHydration();

  const [mode, setMode] = useState<GenerationMode>("video");
  const [sourceType, setSourceType] = useState<SourceType>("image");
  const [idea, setIdea] = useState("");
  const [extraDetails, setExtraDetails] = useState("");
  const [sceneCount, setSceneCount] = useState(10);
  const [style, setStyle] = useState("cinematic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [images, setImages] = useState<string[]>([]);
  const [mediaKind, setMediaKind] = useState<"image" | "video" | null>(null);
  const [mediaName, setMediaName] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previousTitle, setPreviousTitle] = useState<string | undefined>();
  const [previousLogline, setPreviousLogline] = useState<string | undefined>();
  const [previousLastScenes, setPreviousLastScenes] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<(SceneBundle & { id?: string }) | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const { copiedKey, copy } = useCopyFeedback();

  useEffect(() => {
    if (!historyId || !historyReady) return;
    const item = historyGet(historyId);
    if (!item) return;
    setResult({
      id: item.id,
      title: item.title,
      logline: item.logline,
      scenes: item.scenes,
    });
    setMode(item.mode);
    setSourceType(item.sourceType);
    setIdea(item.idea);
    setStyle(item.style);
    setAspectRatio(item.aspectRatio);
    setSceneCount(item.sceneCount);
    setErrorMsg(null);
  }, [historyId, historyGet, historyReady]);

  useEffect(() => {
    if (!pending) return;
    setLoadingStep(0);
    const t = window.setInterval(
      () => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      2400,
    );
    return () => window.clearInterval(t);
  }, [pending]);

  const canSubmit = useMemo(() => {
    if (pending) return false;
    if (sourceType === "image" || sourceType === "video") {
      return images.length > 0 || idea.trim().length > 0;
    }
    return idea.trim().length > 0;
  }, [pending, sourceType, images.length, idea]);

  const clearMedia = () => {
    setImages([]);
    setMediaKind(null);
    setMediaName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setErrorMsg(null);
    try {
      if (file.type.startsWith("video/")) {
        const { frames } = await extractVideoFrames(file);
        setImages(frames);
        setMediaKind("video");
        setMediaName(file.name);
        setSourceType("video");
      } else if (file.type.startsWith("image/")) {
        const dataUrl = await fileToResizedDataUrl(file);
        setImages([dataUrl]);
        setMediaKind("image");
        setMediaName(file.name);
        setSourceType("image");
      } else {
        setErrorMsg("รองรับเฉพาะไฟล์รูปภาพหรือวิดีโอ");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "อ่านไฟล์ไม่สำเร็จ");
    }
  };

  const loadSample = async () => {
    setErrorMsg(null);
    try {
      const dataUrl = await dataUrlFromRemote("/samples/phaopanya-convoy.jpg");
      setImages([dataUrl]);
      setMediaKind("image");
      setMediaName("ตัวอย่างขบวนรถฝน");
      setSourceType("image");
      setMode("video");
      setIdea(
        "ขบวนรถกระบะขนส่งขาวโลโก้ Phaopanya Transport (มาสคอตหมวกตัวตลก) แล่นฝ่าฝนและน้ำท่วม ต้องไปส่งของให้ถึงตามนัด ไม่ว่าพายุจะหนักแค่ไหน",
      );
      setStyle("cinematic");
      setAspectRatio("16:9");
      setSceneCount(10);
    } catch {
      setErrorMsg("โหลดรูปตัวอย่างไม่สำเร็จ");
    }
  };

  const submit = async () => {
    setErrorMsg(null);
    setResult(null);
    if (historyId) {
      void navigate({ search: { g: undefined }, replace: true });
    }
    setPending(true);
    try {
      const data = await generateScenes({
        data: {
          mode,
          sourceType,
          idea:
            idea.trim() ||
            (sourceType === "video"
              ? "สร้างเรื่องราวต่อเนื่องจากคลิปที่แนบมา โดยต่อจากเฟรมสุดท้ายแล้วเดินเรื่องไปข้างหน้า"
              : "สร้างเรื่องราวต่อเนื่องจากรูปภาพที่แนบมา โดยวิเคราะห์องค์ประกอบในภาพเป็นจุดเริ่มต้น"),
          sceneCount,
          style,
          aspectRatio,
          extraDetails: extraDetails.trim() || undefined,
          images:
            sourceType === "idea"
              ? []
              : images,
          previousTitle,
          previousLogline,
          previousLastScenes,
        },
      });
      if (!data.ok) {
        setErrorMsg(data.error);
        return;
      }
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const item: HistoryItem = {
        id,
        createdAt: Date.now(),
        mode,
        sourceType,
        title: data.bundle.title,
        logline: data.bundle.logline,
        idea: idea.trim(),
        style,
        aspectRatio,
        sceneCount: data.bundle.scenes.length,
        scenes: data.bundle.scenes,
        thumbDataUrl: images[0],
      };
      historyAdd(item);
      setResult({ id, ...data.bundle });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "สร้างพร้อมต์ไม่สำเร็จ");
    } finally {
      setPending(false);
    }
  };

  const continueFromResult = () => {
    if (!result) return;
    setPreviousTitle(result.title);
    setPreviousLogline(result.logline);
    setPreviousLastScenes(formatScenesForContinue(result.scenes));
    setSourceType("video");
    setIdea(
      `ต่อจากเรื่อง "${result.title}" — เดินเรื่องต่อจากฉากสุดท้ายโดยไม่ย้อนเล่า อยากให้เข้มขึ้นและมีจุดพีคใหม่`,
    );
    setResult(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyAll = () => {
    if (!result) return;
    void copy("all", bundleToPlainText(result));
  };

  const ideaLabel =
    sourceType === "video"
      ? "เล่าเรื่องเดิมและสิ่งที่อยากให้เกิดต่อ"
      : sourceType === "image"
        ? "บรรยายเพิ่มเติม (ไม่บังคับ)"
        : "ไอเดียเรื่องราวของคุณ";

  const ideaPlaceholder =
    sourceType === "video"
      ? "เช่น คลิปเดิมเป็นรถกระบะขนส่งแล่นฝ่าฝนและน้ำท่วม อยากให้ต่อไปรถทะลุออกจากน้ำแล้วขับขึ้นสะพานตอนฟ้าสาง…"
      : sourceType === "image"
        ? "เช่น อยากให้รถคันนี้แล่นต่อไปเรื่อยๆ จนเจอสายรุ้งตอนฝนหยุด…"
        : "เช่น ขบวนรถกระบะขนส่งแล่นฝ่าพายุฝนกลางถนนน้ำท่วม ไปส่งของให้ทันเวลา…";

  const stepPad = sourceType === "idea" ? 0 : 1;
  const n = (base: number) => String(base + stepPad).padStart(2, "0");

  const accept =
    sourceType === "video"
      ? "video/*,image/*"
      : sourceType === "image"
        ? "image/*,video/*"
        : "image/*,video/*";

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-10">
      {!ai.available ? (
        <div className="mb-6 rounded-lg border border-border bg-secondary px-4 py-3.5 text-sm text-muted-foreground">
          ระบบออกแบบพร้อมต์ยังไม่พร้อมในสภาพแวดล้อมนี้ — ตั้งค่า API key
          (OPENROUTER_API_KEY หรือ XAI_API_KEY) แล้วลองใหม่
        </div>
      ) : ai.provider ? (
        <div className="mb-6 rounded-lg border border-steel/25 bg-steel/5 px-4 py-3.5 text-sm text-muted-foreground flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-steel pulse-dot" />
          เชื่อมต่อ AI แล้ว —{" "}
          <span className="font-medium text-foreground">
            {ai.provider === "openrouter"
              ? "OpenRouter"
              : ai.provider === "xai"
                ? "xAI Grok"
                : "Z.AI GLM"}
          </span>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="lg:sticky lg:top-20 self-start space-y-7">
          <header className="space-y-2">
            <p className="label-tech text-steel">Director Console</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              ออกแบบพร้อมต์
              <br />
              เป็นฉากต่อเนื่อง
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              อัปโหลดรูปหรือคลิป แล้วให้ AI จินตนาการเป็น {sceneCount} ฉาก
              พร้อมคำสั่งไทย–อังกฤษ นำไปวางสร้างภาพหรือวิดีโอได้ทันที
            </p>
          </header>

          <div>
            <SectionLabel>01 · อยากสร้างอะไร</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { v: "image" as const, label: "รูปภาพ", icon: ImageIcon },
                  { v: "video" as const, label: "วิดีโอ", icon: Film },
                ]
              ).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setMode(o.v)}
                  className={cn(
                    "h-12 rounded-md border flex items-center justify-center gap-2 font-display font-semibold transition-colors",
                    mode === o.v
                      ? "border-steel bg-steel/10 text-steel"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <o.icon className="h-4 w-4" />
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>02 · เริ่มจาก</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {SOURCE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setSourceType(o.value)}
                  title={o.hint}
                  className={cn(
                    "min-h-11 px-2 py-2 rounded-md border text-xs font-medium transition-colors",
                    sourceType === o.value
                      ? "border-foreground bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {sourceType !== "idea" ? (
            <div>
              <SectionLabel>
                03 · {sourceType === "video" ? "คลิปหรือรูปต้นทาง" : "รูปภาพต้นฉบับ"}
              </SectionLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => void handleFile(e.target.files?.[0])}
              />
              {images.length > 0 ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  {mediaKind === "video" && images.length > 1 ? (
                    <div className="grid grid-cols-3 gap-px bg-border">
                      {images.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`เฟรม ${i + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <img
                      src={images[0]}
                      alt="สื่อต้นทาง"
                      className="w-full max-h-56 object-cover"
                    />
                  )}
                  <div className="absolute top-2 left-2 label-tech bg-ink/70 text-foreground px-2 py-1 rounded-sm">
                    {mediaKind === "video" ? "Video frames" : "Still"}
                    {mediaName ? ` · ${mediaName}` : ""}
                  </div>
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 h-11 w-11 rounded-md bg-ink/70 border border-border flex items-center justify-center hover:bg-ink"
                    aria-label="ลบสื่อ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full min-h-28 rounded-xl border border-dashed border-border hover:border-steel/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground p-4"
                >
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">
                    {sourceType === "video"
                      ? "แตะเพื่ออัปโหลดคลิปหรือรูป"
                      : "แตะเพื่ออัปโหลดรูปภาพ"}
                  </span>
                  <span className="text-xs text-muted-foreground/80">
                    {sourceType === "video"
                      ? "ระบบจะสกัดเฟรมต้น กลาง ท้าย เพื่อต่อเรื่อง"
                      : "AI จะวิเคราะห์รูปเป็นฉากเปิดเรื่อง"}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void loadSample()}
                className="mt-2 text-xs text-steel hover:text-foreground transition-colors min-h-11 px-1"
              >
                ใช้ตัวอย่างขบวนรถฝน
              </button>
            </div>
          ) : null}

          {previousTitle ? (
            <div className="rounded-lg border border-border bg-secondary/60 px-3.5 py-3 text-sm">
              <p className="label-tech text-steel mb-1">ต่อจากเรื่องเดิม</p>
              <p className="font-medium">{previousTitle}</p>
              <button
                type="button"
                className="text-xs text-muted-foreground mt-1 min-h-11"
                onClick={() => {
                  setPreviousTitle(undefined);
                  setPreviousLogline(undefined);
                  setPreviousLastScenes(undefined);
                }}
              >
                ยกเลิกการต่อเรื่อง
              </button>
            </div>
          ) : null}

          <div>
            <SectionLabel>
              {n(3)} · {ideaLabel}
            </SectionLabel>
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder={ideaPlaceholder}
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="label-tech text-muted-foreground">
                {n(4)} · จำนวนฉาก
              </span>
              <span className="font-display text-lg font-semibold text-steel">
                {sceneCount}
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={10}
              value={sceneCount}
              onChange={(e) => setSceneCount(Number(e.target.value))}
              className="w-full h-11 accent-[var(--color-steel)] cursor-pointer"
              aria-label="จำนวนฉาก"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>4</span>
              <span>10 ต่อครั้ง</span>
            </div>
          </div>

          <div>
            <SectionLabel>{n(5)} · สไตล์ภาพ</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStyle(s.value)}
                  className={cn(
                    "min-h-11 px-3 rounded-full border text-xs transition-colors",
                    style === s.value
                      ? "border-foreground bg-foreground text-background font-medium"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>{n(6)} · อัตราส่วนภาพ</SectionLabel>
            <div className="grid grid-cols-4 gap-1.5">
              {ASPECT_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAspectRatio(a.value)}
                  className={cn(
                    "min-h-11 rounded-md border font-mono text-xs transition-colors",
                    aspectRatio === a.value
                      ? "border-steel bg-steel/10 text-steel"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="flex items-center gap-1.5 label-tech text-muted-foreground hover:text-foreground min-h-11 transition-colors"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showAdvanced && "rotate-180",
                )}
              />
              รายละเอียดเพิ่มเติม
            </button>
            {showAdvanced ? (
              <Textarea
                value={extraDetails}
                onChange={(e) => setExtraDetails(e.target.value)}
                placeholder="เช่น โทนสีฟ้า-เทา, แสงไฟหน้ารถสะท้อนน้ำ, มุมกล้องต่ำ, มีบทพูดวิทยุ…"
                rows={3}
              />
            ) : null}
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full font-display font-semibold"
            disabled={!canSubmit || !ai.available}
            onClick={() => void submit()}
          >
            {pending ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                กำลังออกแบบ…
              </>
            ) : (
              <>
                <Clapperboard className="h-5 w-5" />
                ออกแบบพร้อมต์ {sceneCount} ฉาก
              </>
            )}
          </Button>
        </section>

        <section className="min-w-0">
          {errorMsg ? (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3.5 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  สร้างพร้อมต์ไม่สำเร็จ
                </p>
                <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
              </div>
            </div>
          ) : null}

          {pending ? (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="relative h-1 bg-secondary overflow-hidden">
                <div className="absolute inset-y-0 w-1/3 bg-steel scanline" />
              </div>
              <div className="p-8 md:p-12 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-steel pulse-dot" />
                  <p className="label-tech text-steel">Generating</p>
                </div>
                <p className="font-display text-2xl md:text-3xl font-semibold">
                  {LOADING_STEPS[loadingStep]}
                </p>
                <div className="space-y-3">
                  {Array.from({ length: Math.min(sceneCount, 5) }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-md bg-secondary/70 animate-pulse"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!pending && !result && !errorMsg ? (
            <div className="border border-dashed border-border rounded-xl p-8 md:p-14 text-center space-y-6">
              <div className="mx-auto h-14 w-14 rounded-xl bg-secondary flex items-center justify-center">
                <Lightbulb className="h-6 w-6 text-steel" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold">
                  เริ่มจากแผงควบคุม
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                  เลือกว่าจะสร้างรูปภาพหรือวิดีโอ ใส่ไอเดียหรืออัปโหลดรูป/คลิป
                  แล้วกดออกแบบพร้อมต์ — ได้ชุดคำสั่งเป็นฉากๆ ที่ต่อกันได้
                  พร้อมปุ่มคัดลอกไปใช้ทันที
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto">
                {[
                  {
                    n: "A",
                    t: "ส่งรูปหรือคลิป",
                    d: "เหมือนตอนส่งรูปขบวนรถฝน แล้วสั่งให้จินตนาการต่อ",
                  },
                  {
                    n: "B",
                    t: "ได้ 10 ฉากต่อครั้ง",
                    d: "แต่ละฉากมีคำสั่งไทยและพร้อมต์อังกฤษ พร้อมโน้ตความต่อเนื่อง",
                  },
                  {
                    n: "C",
                    t: "นำไปสร้างทีละคลิป",
                    d: "ฉากถัดไปส่งคลิปที่เพิ่งได้ — คลิปใหม่มักรวมตอนก่อนไว้ด้วย",
                  },
                ].map((s) => (
                  <div key={s.n} className="border border-border rounded-lg p-4">
                    <p className="font-mono text-steel text-sm font-semibold">{s.n}</p>
                    <p className="font-display font-semibold mt-1.5">{s.t}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {s.d}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {!pending && result ? (
            <div>
              <div className="pb-6 md:pb-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "label-tech px-2.5 py-1.5 rounded-sm border",
                      mode === "video"
                        ? "border-steel/50 text-steel"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {mode === "video" ? "Video" : "Image"} · {result.scenes.length}{" "}
                    scenes
                  </span>
                  <span className="label-tech px-2.5 py-1.5 rounded-sm border border-border text-muted-foreground">
                    {aspectRatio}
                  </span>
                  {historyId ? (
                    <button
                      type="button"
                      onClick={() => {
                        setResult(null);
                        void navigate({ search: { g: undefined }, replace: true });
                      }}
                      className="label-tech px-2.5 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors min-h-11"
                    >
                      ปิดรายการจากประวัติ
                    </button>
                  ) : null}
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                  {result.title}
                </h2>
                {result.logline ? (
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    {result.logline}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyAll}
                    className={cn(copiedKey === "all" && "border-steel text-steel")}
                  >
                    {copiedKey === "all" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copiedKey === "all" ? "คัดลอกแล้ว" : "คัดลอกพร้อมต์ทั้งหมด"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={continueFromResult}>
                    ต่ออีก 10 ฉากจากเรื่องนี้
                  </Button>
                </div>

                {mode === "video" ? (
                  <div className="rounded-lg border border-steel/25 bg-steel/5 px-4 py-3.5 text-sm leading-relaxed text-foreground/80">
                    <span className="label-tech text-steel block mb-1.5">
                      วิธีใช้โหมดวิดีโอ
                    </span>
                    สร้างทีละคลิปตามลำดับฉาก — ฉากที่ 1 ใช้คู่กับ
                    <strong> รูปหรือคลิปต้นฉบับ</strong> ส่วนฉากที่ 2 เป็นต้นไป
                    ให้ส่ง<strong> คลิปที่เพิ่งสร้างเสร็จ</strong> พร้อมวางคำสั่งไทยของฉากนั้น
                    เครื่องมือสร้างวิดีโอมักรวมคลิปก่อนหน้าไว้ในไฟล์ใหม่ที่ยาวขึ้น
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-secondary/50 px-4 py-3.5 text-sm leading-relaxed text-foreground/80">
                    <span className="label-tech text-muted-foreground block mb-1.5">
                      วิธีใช้โหมดรูปภาพ
                    </span>
                    สร้างทีละใบตามลำดับ ใช้พร้อมต์อังกฤษกับเครื่องมือสร้างภาพ
                    หรือใช้คำสั่งไทยในแชท — ล็อกตัวละคร/รถ/โลโก้ถูกเขียนซ้ำทุกฉากแล้ว
                  </div>
                )}
              </div>

              <div>
                {result.scenes.map((scene, i) => (
                  <SceneCard
                    key={`${result.id ?? "new"}-${scene.scene}-${i}`}
                    scene={scene}
                    index={i}
                    copiedKey={copiedKey}
                    onCopy={copy}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
