import { C as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Film, i as Trash2, l as Image, u as History } from "../_libs/lucide-react.mjs";
import { i as cn } from "./router-DpKBwUjp.mjs";
import { n as useHistoryHydration, r as useHistoryStore, t as Button } from "./history-store-CW_u1Vx9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-CPRW-JPA.js
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const navigate = useNavigate();
	const items = useHistoryStore((s) => s.items);
	const remove = useHistoryStore((s) => s.remove);
	const hydrated = useHistoryHydration();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-[1000px] px-4 md:px-8 py-8 md:py-12",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "space-y-2 mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-tech text-steel",
					children: "Archive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl md:text-4xl font-semibold tracking-tight",
					children: "ประวัติการออกแบบ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: "ชุดพร้อมต์ที่เคยสร้างไว้ในเครื่องนี้ — แตะเพื่อเปิดดูและคัดลอกอีกครั้ง"
				})
			]
		}), !hydrated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: [
				0,
				1,
				2
			].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 rounded-lg bg-secondary/70 animate-pulse" }, i))
		}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-dashed border-border rounded-xl p-12 text-center space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(History, { className: "h-8 w-8 mx-auto text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "ยังไม่มีประวัติ — ลองสร้างชุดพร้อมต์ชุดแรกของคุณ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: () => void navigate({ to: "/" }),
					children: "ไปที่สตูดิโอ"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border border-y border-border",
			children: items.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group flex items-center gap-4 py-4 md:py-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex items-center gap-4 min-w-0 flex-1 text-left",
					onClick: () => void navigate({
						to: "/",
						search: { g: g.id }
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("h-11 w-11 shrink-0 rounded-md border flex items-center justify-center overflow-hidden", g.mode === "video" ? "border-steel/40 text-steel" : "border-border text-muted-foreground"),
						children: g.thumbDataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: g.thumbDataUrl,
							alt: "",
							className: "h-full w-full object-cover"
						}) : g.mode === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Film, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display font-semibold truncate",
								children: g.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground truncate mt-0.5",
								children: g.logline || "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "label-tech text-muted-foreground mt-1.5",
								children: [
									g.sceneCount,
									" scenes · ",
									g.aspectRatio,
									" ·",
									" ",
									new Date(g.createdAt).toLocaleDateString("th-TH", {
										day: "numeric",
										month: "short",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit"
									})
								]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (window.confirm(`ลบ "${g.title}" ออกจากประวัติ?`)) remove(g.id);
					},
					className: "h-11 w-11 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
					"aria-label": "ลบรายการ",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				})]
			}, g.id))
		})]
	});
}
//#endregion
export { HistoryPage as component };
