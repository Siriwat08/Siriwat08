import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatScenesForContinue, i as bundleToPlainText, r as STYLE_OPTIONS, t as ASPECT_OPTIONS } from "./studio-BsMESzDd.mjs";
import { c as Lightbulb, d as Film, f as Copy, h as Check, l as Image$1, m as ChevronDown, n as Upload, o as RefreshCcw, p as Clapperboard, r as TriangleAlert, s as Link2, t as X } from "../_libs/lucide-react.mjs";
import { i as cn, n as Route$1, r as generateScenes } from "./router-DpKBwUjp.mjs";
import { n as useHistoryHydration, r as useHistoryStore, t as Button } from "./history-store-CW_u1Vx9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Be9XxpS5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		ref,
		className: cn("w-full min-h-24 rounded-lg bg-card border border-border px-3.5 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-steel/50 resize-y", className),
		...props
	});
});
Textarea.displayName = "Textarea";
async function copyText(text) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const ta = document.createElement("textarea");
			ta.value = text;
			ta.style.position = "fixed";
			ta.style.opacity = "0";
			document.body.appendChild(ta);
			ta.select();
			document.execCommand("copy");
			document.body.removeChild(ta);
			return true;
		} catch {
			return false;
		}
	}
}
function useCopyFeedback() {
	const [copiedKey, setCopiedKey] = (0, import_react.useState)(null);
	const copy = async (key, text) => {
		const ok = await copyText(text);
		if (ok) {
			setCopiedKey(key);
			window.setTimeout(() => setCopiedKey((k) => k === key ? null : k), 1600);
		}
		return ok;
	};
	return {
		copiedKey,
		copy
	};
}
function CopyButton({ id, text, label, copiedKey, onCopy }) {
	const copied = copiedKey === id;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		variant: "outline",
		size: "sm",
		onClick: () => onCopy(id, text),
		className: cn("label-tech h-9", copied && "border-steel text-steel"),
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" }), copied ? "คัดลอกแล้ว" : label]
	});
}
function SceneCard({ scene, index, copiedKey, onCopy }) {
	const num = String(scene.scene).padStart(2, "0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
		className: "scene-in border-t border-border py-6 md:py-8",
		style: { animationDelay: `${Math.min(index, 8) * 70}ms` },
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[auto_1fr] gap-4 md:gap-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2 pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "label-tech text-steel",
						children: "Scene"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-4xl md:text-5xl font-semibold leading-none tracking-tight",
						children: num
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 w-px bg-border min-h-8" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-xl md:text-2xl font-semibold tracking-tight",
								children: scene.titleTh
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: scene.descriptionTh
							}),
							scene.continuityNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-start gap-2 text-xs md:text-sm text-steel leading-relaxed pt-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: scene.continuityNote })]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "prompt-block rounded-lg overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-tech text-muted-foreground",
								children: "Prompt · EN"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
								id: `en-${scene.scene}`,
								text: scene.promptEn,
								label: "Copy",
								copiedKey,
								onCopy
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3.5 py-3.5 font-mono text-xs leading-relaxed text-foreground/85 break-words",
							children: scene.promptEn
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "prompt-block rounded-lg overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-tech text-muted-foreground",
								children: "คำสั่ง · TH"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
								id: `th-${scene.scene}`,
								text: scene.promptTh,
								label: "คัดลอก",
								copiedKey,
								onCopy
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-3.5 py-3.5 text-sm leading-relaxed text-foreground/85 break-words",
							children: scene.promptTh
						})]
					})
				]
			})]
		})
	});
}
var MAX_EDGE = 768;
var JPEG_QUALITY = .74;
function canvasToJpeg(canvas) {
	return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
function drawToCanvas(source, width, height) {
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
function fileToResizedDataUrl(file) {
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
			reject(/* @__PURE__ */ new Error("ไฟล์รูปภาพไม่ถูกต้อง"));
		};
		img.src = url;
	});
}
function dataUrlFromRemote(src) {
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
		img.onerror = () => reject(/* @__PURE__ */ new Error("โหลดรูปตัวอย่างไม่สำเร็จ"));
		img.src = src;
	});
}
function seekVideo(video, time) {
	return new Promise((resolve, reject) => {
		const onSeeked = () => {
			video.removeEventListener("seeked", onSeeked);
			video.removeEventListener("error", onError);
			resolve();
		};
		const onError = () => {
			video.removeEventListener("seeked", onSeeked);
			video.removeEventListener("error", onError);
			reject(/* @__PURE__ */ new Error("เลื่อนคลิปไม่สำเร็จ"));
		};
		video.addEventListener("seeked", onSeeked);
		video.addEventListener("error", onError);
		video.currentTime = time;
	});
}
async function extractVideoFrames(file) {
	const url = URL.createObjectURL(file);
	const video = document.createElement("video");
	video.muted = true;
	video.playsInline = true;
	video.preload = "auto";
	video.src = url;
	try {
		await new Promise((resolve, reject) => {
			const onReady = () => {
				video.removeEventListener("loadeddata", onReady);
				video.removeEventListener("error", onErr);
				resolve();
			};
			const onErr = () => {
				video.removeEventListener("loadeddata", onReady);
				video.removeEventListener("error", onErr);
				reject(/* @__PURE__ */ new Error("อ่านคลิปวิดีโอไม่สำเร็จ"));
			};
			video.addEventListener("loadeddata", onReady);
			video.addEventListener("error", onErr);
		});
		const duration = Number.isFinite(video.duration) ? video.duration : 0;
		const times = duration > 1.2 ? [
			.04 * duration,
			.5 * duration,
			Math.max(0, duration - .12)
		] : [0];
		const frames = [];
		for (const t of times) {
			await seekVideo(video, Math.max(0, t));
			frames.push(drawToCanvas(video, video.videoWidth || 1280, video.videoHeight || 720));
		}
		return {
			frames,
			durationSec: duration
		};
	} finally {
		video.src = "";
		URL.revokeObjectURL(url);
	}
}
var LOADING_STEPS = [
	"กำลังอ่านสื่อและไอเดียของคุณ…",
	"กำลังวางโครงเรื่องเป็นฉากๆ…",
	"กำลังเขียนพร้อมต์แต่ละฉาก…",
	"กำลังล็อกตัวตนและความต่อเนื่อง…"
];
var SOURCE_OPTIONS = [
	{
		value: "idea",
		label: "จากไอเดีย",
		hint: "พิมพ์เรื่องที่จินตนาการไว้"
	},
	{
		value: "image",
		label: "จากรูปภาพ",
		hint: "อัปโหลดรูปเป็นฉากเปิด"
	},
	{
		value: "video",
		label: "จากคลิป",
		hint: "ต่อเรื่องจากคลิปที่มีอยู่"
	}
];
function SectionLabel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "label-tech text-muted-foreground mb-2.5",
		children
	});
}
function StudioPage() {
	const { g: historyId } = Route$1.useSearch();
	const ai = Route$1.useLoaderData();
	const navigate = useNavigate({ from: "/" });
	const historyGet = useHistoryStore((s) => s.get);
	const historyAdd = useHistoryStore((s) => s.add);
	const historyReady = useHistoryHydration();
	const [mode, setMode] = (0, import_react.useState)("video");
	const [sourceType, setSourceType] = (0, import_react.useState)("image");
	const [idea, setIdea] = (0, import_react.useState)("");
	const [extraDetails, setExtraDetails] = (0, import_react.useState)("");
	const [sceneCount, setSceneCount] = (0, import_react.useState)(10);
	const [style, setStyle] = (0, import_react.useState)("cinematic");
	const [aspectRatio, setAspectRatio] = (0, import_react.useState)("16:9");
	const [images, setImages] = (0, import_react.useState)([]);
	const [mediaKind, setMediaKind] = (0, import_react.useState)(null);
	const [mediaName, setMediaName] = (0, import_react.useState)(null);
	const [showAdvanced, setShowAdvanced] = (0, import_react.useState)(false);
	const [previousTitle, setPreviousTitle] = (0, import_react.useState)();
	const [previousLogline, setPreviousLogline] = (0, import_react.useState)();
	const [previousLastScenes, setPreviousLastScenes] = (0, import_react.useState)();
	const fileInputRef = (0, import_react.useRef)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	const [errorMsg, setErrorMsg] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [loadingStep, setLoadingStep] = (0, import_react.useState)(0);
	const { copiedKey, copy } = useCopyFeedback();
	(0, import_react.useEffect)(() => {
		if (!historyId || !historyReady) return;
		const item = historyGet(historyId);
		if (!item) return;
		setResult({
			id: item.id,
			title: item.title,
			logline: item.logline,
			scenes: item.scenes
		});
		setMode(item.mode);
		setSourceType(item.sourceType);
		setIdea(item.idea);
		setStyle(item.style);
		setAspectRatio(item.aspectRatio);
		setSceneCount(item.sceneCount);
		setErrorMsg(null);
	}, [
		historyId,
		historyGet,
		historyReady
	]);
	(0, import_react.useEffect)(() => {
		if (!pending) return;
		setLoadingStep(0);
		const t = window.setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 2400);
		return () => window.clearInterval(t);
	}, [pending]);
	const canSubmit = (0, import_react.useMemo)(() => {
		if (pending) return false;
		if (sourceType === "image" || sourceType === "video") return images.length > 0 || idea.trim().length > 0;
		return idea.trim().length > 0;
	}, [
		pending,
		sourceType,
		images.length,
		idea
	]);
	const clearMedia = () => {
		setImages([]);
		setMediaKind(null);
		setMediaName(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};
	const handleFile = async (file) => {
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
			} else setErrorMsg("รองรับเฉพาะไฟล์รูปภาพหรือวิดีโอ");
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
			setIdea("ขบวนรถกระบะขนส่งขาวโลโก้ Phaopanya Transport (มาสคอตหมวกตัวตลก) แล่นฝ่าฝนและน้ำท่วม ต้องไปส่งของให้ถึงตามนัด ไม่ว่าพายุจะหนักแค่ไหน");
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
		if (historyId) navigate({
			search: {},
			replace: true
		});
		setPending(true);
		try {
			const data = await generateScenes({ data: {
				mode,
				sourceType,
				idea: idea.trim() || (sourceType === "video" ? "สร้างเรื่องราวต่อเนื่องจากคลิปที่แนบมา โดยต่อจากเฟรมสุดท้ายแล้วเดินเรื่องไปข้างหน้า" : "สร้างเรื่องราวต่อเนื่องจากรูปภาพที่แนบมา โดยวิเคราะห์องค์ประกอบในภาพเป็นจุดเริ่มต้น"),
				sceneCount,
				style,
				aspectRatio,
				extraDetails: extraDetails.trim() || void 0,
				images: sourceType === "idea" ? [] : images,
				previousTitle,
				previousLogline,
				previousLastScenes
			} });
			if (!data.ok) {
				setErrorMsg(data.error);
				return;
			}
			const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
			const item = {
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
				thumbDataUrl: images[0]
			};
			historyAdd(item);
			setResult({
				id,
				...data.bundle
			});
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
		setIdea(`ต่อจากเรื่อง "${result.title}" — เดินเรื่องต่อจากฉากสุดท้ายโดยไม่ย้อนเล่า อยากให้เข้มขึ้นและมีจุดพีคใหม่`);
		setResult(null);
		setErrorMsg(null);
		window.scrollTo({
			top: 0,
			behavior: "smooth"
		});
	};
	const copyAll = () => {
		if (!result) return;
		copy("all", bundleToPlainText(result));
	};
	const ideaLabel = sourceType === "video" ? "เล่าเรื่องเดิมและสิ่งที่อยากให้เกิดต่อ" : sourceType === "image" ? "บรรยายเพิ่มเติม (ไม่บังคับ)" : "ไอเดียเรื่องราวของคุณ";
	const ideaPlaceholder = sourceType === "video" ? "เช่น คลิปเดิมเป็นรถกระบะขนส่งแล่นฝ่าฝนและน้ำท่วม อยากให้ต่อไปรถทะลุออกจากน้ำแล้วขับขึ้นสะพานตอนฟ้าสาง…" : sourceType === "image" ? "เช่น อยากให้รถคันนี้แล่นต่อไปเรื่อยๆ จนเจอสายรุ้งตอนฝนหยุด…" : "เช่น ขบวนรถกระบะขนส่งแล่นฝ่าพายุฝนกลางถนนน้ำท่วม ไปส่งของให้ทันเวลา…";
	const stepPad = sourceType === "idea" ? 0 : 1;
	const n = (base) => String(base + stepPad).padStart(2, "0");
	const accept = sourceType === "video" ? "video/*,image/*" : sourceType === "image" ? "image/*,video/*" : "image/*,video/*";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-10",
		children: [!ai.available ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-6 rounded-lg border border-border bg-secondary px-4 py-3.5 text-sm text-muted-foreground",
			children: "ระบบออกแบบพร้อมต์ยังไม่พร้อมในสภาพแวดล้อมนี้ — ลองใหม่เมื่อเชื่อมต่อ AI แล้ว"
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-10 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "lg:sticky lg:top-20 self-start space-y-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech text-steel",
								children: "Director Console"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-3xl md:text-4xl font-semibold tracking-tight leading-tight",
								children: [
									"ออกแบบพร้อมต์",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"เป็นฉากต่อเนื่อง"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground leading-relaxed",
								children: [
									"อัปโหลดรูปหรือคลิป แล้วให้ AI จินตนาการเป็น ",
									sceneCount,
									" ฉาก พร้อมคำสั่งไทย–อังกฤษ นำไปวางสร้างภาพหรือวิดีโอได้ทันที"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "01 · อยากสร้างอะไร" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [{
							v: "image",
							label: "รูปภาพ",
							icon: Image$1
						}, {
							v: "video",
							label: "วิดีโอ",
							icon: Film
						}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setMode(o.v),
							className: cn("h-12 rounded-md border flex items-center justify-center gap-2 font-display font-semibold transition-colors", mode === o.v ? "border-steel bg-steel/10 text-steel" : "border-border text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(o.icon, { className: "h-4 w-4" }), o.label]
						}, o.v))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, { children: "02 · เริ่มจาก" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 gap-2",
						children: SOURCE_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSourceType(o.value),
							title: o.hint,
							className: cn("min-h-11 px-2 py-2 rounded-md border text-xs font-medium transition-colors", sourceType === o.value ? "border-foreground bg-secondary text-foreground" : "border-border text-muted-foreground hover:text-foreground"),
							children: o.label
						}, o.value))
					})] }),
					sourceType !== "idea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: ["03 · ", sourceType === "video" ? "คลิปหรือรูปต้นทาง" : "รูปภาพต้นฉบับ"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: fileInputRef,
							type: "file",
							accept,
							className: "hidden",
							onChange: (e) => void handleFile(e.target.files?.[0])
						}),
						images.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative rounded-xl overflow-hidden border border-border",
							children: [
								mediaKind === "video" && images.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-px bg-border",
									children: images.map((src, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src,
										alt: `เฟรม ${i + 1}`,
										className: "w-full h-24 object-cover"
									}, i))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: images[0],
									alt: "สื่อต้นทาง",
									className: "w-full max-h-56 object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute top-2 left-2 label-tech bg-ink/70 text-foreground px-2 py-1 rounded-sm",
									children: [mediaKind === "video" ? "Video frames" : "Still", mediaName ? ` · ${mediaName}` : ""]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: clearMedia,
									className: "absolute top-2 right-2 h-11 w-11 rounded-md bg-ink/70 border border-border flex items-center justify-center hover:bg-ink",
									"aria-label": "ลบสื่อ",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => fileInputRef.current?.click(),
							className: "w-full min-h-28 rounded-xl border border-dashed border-border hover:border-steel/60 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-5 w-5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: sourceType === "video" ? "แตะเพื่ออัปโหลดคลิปหรือรูป" : "แตะเพื่ออัปโหลดรูปภาพ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground/80",
									children: sourceType === "video" ? "ระบบจะสกัดเฟรมต้น กลาง ท้าย เพื่อต่อเรื่อง" : "AI จะวิเคราะห์รูปเป็นฉากเปิดเรื่อง"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void loadSample(),
							className: "mt-2 text-xs text-steel hover:text-foreground transition-colors min-h-11 px-1",
							children: "ใช้ตัวอย่างขบวนรถฝน"
						})
					] }) : null,
					previousTitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border bg-secondary/60 px-3.5 py-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-tech text-steel mb-1",
								children: "ต่อจากเรื่องเดิม"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: previousTitle
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "text-xs text-muted-foreground mt-1 min-h-11",
								onClick: () => {
									setPreviousTitle(void 0);
									setPreviousLogline(void 0);
									setPreviousLastScenes(void 0);
								},
								children: "ยกเลิกการต่อเรื่อง"
							})
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [
						n(3),
						" · ",
						ideaLabel
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: idea,
						onChange: (e) => setIdea(e.target.value),
						placeholder: ideaPlaceholder,
						rows: 4
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "label-tech text-muted-foreground",
								children: [n(4), " · จำนวนฉาก"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-lg font-semibold text-steel",
								children: sceneCount
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 4,
							max: 10,
							value: sceneCount,
							onChange: (e) => setSceneCount(Number(e.target.value)),
							className: "w-full h-11 accent-[var(--color-steel)] cursor-pointer",
							"aria-label": "จำนวนฉาก"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-xs text-muted-foreground mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10 ต่อครั้ง" })]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [n(5), " · สไตล์ภาพ"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: STYLE_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setStyle(s.value),
							className: cn("min-h-11 px-3 rounded-full border text-xs transition-colors", style === s.value ? "border-foreground bg-foreground text-background font-medium" : "border-border text-muted-foreground hover:text-foreground"),
							children: s.label
						}, s.value))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SectionLabel, { children: [n(6), " · อัตราส่วนภาพ"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-1.5",
						children: ASPECT_OPTIONS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setAspectRatio(a.value),
							className: cn("min-h-11 rounded-md border font-mono text-xs transition-colors", aspectRatio === a.value ? "border-steel bg-steel/10 text-steel" : "border-border text-muted-foreground hover:text-foreground"),
							children: a.value
						}, a.value))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setShowAdvanced((v) => !v),
						className: "flex items-center gap-1.5 label-tech text-muted-foreground hover:text-foreground min-h-11 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("h-3.5 w-3.5 transition-transform", showAdvanced && "rotate-180") }), "รายละเอียดเพิ่มเติม"]
					}), showAdvanced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: extraDetails,
						onChange: (e) => setExtraDetails(e.target.value),
						placeholder: "เช่น โทนสีฟ้า-เทา, แสงไฟหน้ารถสะท้อนน้ำ, มุมกล้องต่ำ, มีบทพูดวิทยุ…",
						rows: 3
					}) : null] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						size: "lg",
						className: "w-full font-display font-semibold",
						disabled: !canSubmit || !ai.available,
						onClick: () => void submit(),
						children: pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCcw, { className: "h-4 w-4 animate-spin" }), "กำลังออกแบบ…"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clapperboard, { className: "h-5 w-5" }),
							"ออกแบบพร้อมต์ ",
							sceneCount,
							" ฉาก"
						] })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0",
				children: [
					errorMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3.5 flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-destructive shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium text-destructive",
							children: "สร้างพร้อมต์ไม่สำเร็จ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: errorMsg
						})] })]
					}) : null,
					pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-border rounded-xl overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "relative h-1 bg-secondary overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-y-0 w-1/3 bg-steel scanline" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-8 md:p-12 space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-full bg-steel pulse-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "label-tech text-steel",
										children: "Generating"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl md:text-3xl font-semibold",
									children: LOADING_STEPS[loadingStep]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: Array.from({ length: Math.min(sceneCount, 5) }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-16 rounded-md bg-secondary/70 animate-pulse",
										style: { animationDelay: `${i * 150}ms` }
									}, i))
								})
							]
						})]
					}) : null,
					!pending && !result && !errorMsg ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border border-dashed border-border rounded-xl p-8 md:p-14 text-center space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto h-14 w-14 rounded-xl bg-secondary flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "h-6 w-6 text-steel" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-2xl font-semibold",
									children: "เริ่มจากแผงด้านซ้าย"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground text-sm leading-relaxed max-w-md mx-auto",
									children: "เลือกว่าจะสร้างรูปภาพหรือวิดีโอ ใส่ไอเดียหรืออัปโหลดรูป/คลิป แล้วกดออกแบบพร้อมต์ — ได้ชุดคำสั่งเป็นฉากๆ ที่ต่อกันได้ พร้อมปุ่มคัดลอกไปใช้ทันที"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto",
								children: [
									{
										n: "A",
										t: "ส่งรูปหรือคลิป",
										d: "เหมือนตอนส่งรูปขบวนรถฝน แล้วสั่งให้จินตนาการต่อ"
									},
									{
										n: "B",
										t: "ได้ 10 ฉากต่อครั้ง",
										d: "แต่ละฉากมีคำสั่งไทยและพร้อมต์อังกฤษ พร้อมโน้ตความต่อเนื่อง"
									},
									{
										n: "C",
										t: "นำไปสร้างทีละคลิป",
										d: "ฉากถัดไปส่งคลิปที่เพิ่งได้ — คลิปใหม่มักรวมตอนก่อนไว้ด้วย"
									}
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border border-border rounded-lg p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-steel text-sm font-semibold",
											children: s.n
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display font-semibold mt-1.5",
											children: s.t
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-1 leading-relaxed",
											children: s.d
										})
									]
								}, s.n))
							})
						]
					}) : null,
					!pending && result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pb-6 md:pb-8 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("label-tech px-2.5 py-1.5 rounded-sm border", mode === "video" ? "border-steel/50 text-steel" : "border-border text-muted-foreground"),
										children: [
											mode === "video" ? "Video" : "Image",
											" · ",
											result.scenes.length,
											" ",
											"scenes"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "label-tech px-2.5 py-1.5 rounded-sm border border-border text-muted-foreground",
										children: aspectRatio
									}),
									historyId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setResult(null);
											navigate({
												search: {},
												replace: true
											});
										},
										className: "label-tech px-2.5 py-1.5 rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors min-h-11",
										children: "ปิดรายการจากประวัติ"
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-3xl md:text-4xl font-semibold tracking-tight leading-tight",
								children: result.title
							}),
							result.logline ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted-foreground leading-relaxed max-w-2xl",
								children: result.logline
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									variant: "outline",
									onClick: copyAll,
									className: cn(copiedKey === "all" && "border-steel text-steel"),
									children: [copiedKey === "all" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), copiedKey === "all" ? "คัดลอกแล้ว" : "คัดลอกพร้อมต์ทั้งหมด"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									onClick: continueFromResult,
									children: "ต่ออีก 10 ฉากจากเรื่องนี้"
								})]
							}),
							mode === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-steel/25 bg-steel/5 px-4 py-3.5 text-sm leading-relaxed text-foreground/80",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "label-tech text-steel block mb-1.5",
										children: "วิธีใช้โหมดวิดีโอ"
									}),
									"สร้างทีละคลิปตามลำดับฉาก — ฉากที่ 1 ใช้คู่กับ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: " รูปหรือคลิปต้นฉบับ" }),
									" ส่วนฉากที่ 2 เป็นต้นไป ให้ส่ง",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: " คลิปที่เพิ่งสร้างเสร็จ" }),
									" พร้อมวางคำสั่งไทยของฉากนั้น เครื่องมือสร้างวิดีโอมักรวมคลิปก่อนหน้าไว้ในไฟล์ใหม่ที่ยาวขึ้น"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border border-border bg-secondary/50 px-4 py-3.5 text-sm leading-relaxed text-foreground/80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "label-tech text-muted-foreground block mb-1.5",
									children: "วิธีใช้โหมดรูปภาพ"
								}), "สร้างทีละใบตามลำดับ ใช้พร้อมต์อังกฤษกับเครื่องมือสร้างภาพ หรือใช้คำสั่งไทยในแชท — ล็อกตัวละคร/รถ/โลโก้ถูกเขียนซ้ำทุกฉากแล้ว"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: result.scenes.map((scene, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneCard, {
						scene,
						index: i,
						copiedKey,
						onCopy: copy
					}, `${result.id ?? "new"}-${scene.scene}-${i}`)) })] }) : null
				]
			})]
		})]
	});
}
//#endregion
export { StudioPage as component };
