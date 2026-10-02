import { Link, useRouterState } from "@tanstack/react-router";
import { Clapperboard, History, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative h-8 w-8 rounded-md bg-steel flex items-center justify-center">
        <Clapperboard className="h-4 w-4 text-ink" strokeWidth={2.2} />
        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-foreground pulse-dot" />
      </div>
      <div className="leading-none">
        <div className="font-display font-semibold text-[15px] tracking-tight">
          PromptReel
        </div>
        <div className="label-tech text-muted-foreground mt-1">
          Scene Prompt Studio
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { label: "สตูดิโอ", path: "/", icon: Sparkles },
    { label: "ประวัติ", path: "/history", icon: History },
  ];

  return (
    <div className="min-h-dvh flex flex-col bg-background text-foreground">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 bg-background/90 backdrop-blur-md">
        <Link to="/" search={{ g: undefined }} aria-label="PromptReel หน้าแรก">
          <BrandMark />
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((item) => {
            const active =
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "h-11 px-3 md:px-4 rounded-md flex items-center gap-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border px-4 md:px-8 py-4 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
        <p className="label-tech text-muted-foreground">
          PromptReel · ออกแบบพร้อมต์เป็นฉากต่อเนื่อง
        </p>
        <p className="text-xs text-muted-foreground">
          แต่ละครั้งที่กดออกแบบใช้โควต้า AI ของเจ้าของแอป
        </p>
      </footer>
    </div>
  );
}
