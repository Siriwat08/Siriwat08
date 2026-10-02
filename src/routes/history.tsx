import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Film, History as HistoryIcon, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHistoryStore, useHistoryHydration } from "@/lib/history-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const navigate = useNavigate();
  const items = useHistoryStore((s) => s.items);
  const remove = useHistoryStore((s) => s.remove);
  const hydrated = useHistoryHydration();

  return (
    <div className="mx-auto max-w-[1000px] px-4 md:px-8 py-8 md:py-12">
      <header className="space-y-2 mb-8">
        <p className="label-tech text-steel">Archive</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          ประวัติการออกแบบ
        </h1>
        <p className="text-muted-foreground text-sm">
          ชุดพร้อมต์ที่เคยสร้างไว้ในเครื่องนี้ — แตะเพื่อเปิดดูและคัดลอกอีกครั้ง
        </p>
      </header>

      {!hydrated ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-secondary/70 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-4">
          <HistoryIcon className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            ยังไม่มีประวัติ — ลองสร้างชุดพร้อมต์ชุดแรกของคุณ
          </p>
          <Button type="button" onClick={() => void navigate({ to: "/", search: { g: undefined } })}>
            ไปที่สตูดิโอ
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {items.map((g) => (
            <div
              key={g.id}
              className="group flex items-center gap-4 py-4 md:py-5"
            >
              <button
                type="button"
                className="flex items-center gap-4 min-w-0 flex-1 text-left"
                onClick={() => void navigate({ to: "/", search: { g: g.id } })}
              >
                <div
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-md border flex items-center justify-center overflow-hidden",
                    g.mode === "video"
                      ? "border-steel/40 text-steel"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {g.thumbDataUrl ? (
                    <img
                      src={g.thumbDataUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : g.mode === "video" ? (
                    <Film className="h-4 w-4" />
                  ) : (
                    <ImageIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold truncate">{g.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {g.logline || "—"}
                  </p>
                  <p className="label-tech text-muted-foreground mt-1.5">
                    {g.sceneCount} scenes · {g.aspectRatio} ·{" "}
                    {new Date(g.createdAt).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`ลบ "${g.title}" ออกจากประวัติ?`)) {
                    remove(g.id);
                  }
                }}
                className="h-11 w-11 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="ลบรายการ"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
