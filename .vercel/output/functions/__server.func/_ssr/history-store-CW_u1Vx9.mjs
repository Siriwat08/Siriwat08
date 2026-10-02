import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn } from "./router-DpKBwUjp.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-store-CW_u1Vx9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[opacity,transform,background-color,border-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-steel",
			secondary: "bg-secondary text-secondary-foreground border border-border hover:border-steel/40",
			outline: "border border-border bg-transparent text-foreground hover:border-steel/50 hover:text-steel",
			ghost: "text-muted-foreground hover:text-foreground hover:bg-secondary",
			steel: "bg-steel text-accent-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-xs",
			lg: "h-14 px-5 text-base",
			icon: "h-11 w-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var MAX_ITEMS = 40;
var useHistoryStore = create()(persist((set, get) => ({
	items: [],
	add: (item) => set((state) => ({ items: [item, ...state.items.filter((x) => x.id !== item.id)].slice(0, MAX_ITEMS) })),
	remove: (id) => set((state) => ({ items: state.items.filter((x) => x.id !== id) })),
	get: (id) => get().items.find((x) => x.id === id),
	clear: () => set({ items: [] })
}), {
	name: "promptreel-history",
	skipHydration: true
}));
function useHistoryHydration() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		useHistoryStore.persist.rehydrate().then(() => setHydrated(true));
	}, []);
	return hydrated;
}
//#endregion
export { useHistoryHydration as n, useHistoryStore as r, Button as t };
