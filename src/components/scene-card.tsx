import { useState } from "react";
import { Check, Copy, Link2 } from "lucide-react";
import type { ScenePrompt } from "@/lib/studio";
import { copyText } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((k) => (k === key ? null : k)),
        1600,
      );
    }
    return ok;
  };
  return { copiedKey, copy };
}

function CopyButton({
  id,
  text,
  label,
  copiedKey,
  onCopy,
}: {
  id: string;
  text: string;
  label: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const copied = copiedKey === id;
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => onCopy(id, text)}
      className={cn(
        "label-tech h-9",
        copied && "border-steel text-steel",
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "คัดลอกแล้ว" : label}
    </Button>
  );
}

export function SceneCard({
  scene,
  index,
  copiedKey,
  onCopy,
}: {
  scene: ScenePrompt;
  index: number;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
}) {
  const num = String(scene.scene).padStart(2, "0");
  return (
    <article
      className="scene-in border-t border-border py-6 md:py-8"
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      <div className="grid grid-cols-[auto_1fr] gap-4 md:gap-8">
        <div className="flex flex-col items-center gap-2 pt-1">
          <span className="label-tech text-steel">Scene</span>
          <span className="font-display text-4xl md:text-5xl font-semibold leading-none tracking-tight">
            {num}
          </span>
          <div className="flex-1 w-px bg-border min-h-8" />
        </div>

        <div className="min-w-0 space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
              {scene.titleTh}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {scene.descriptionTh}
            </p>
            {scene.continuityNote ? (
              <p className="flex items-start gap-2 text-xs md:text-sm text-steel leading-relaxed pt-1">
                <Link2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{scene.continuityNote}</span>
              </p>
            ) : null}
          </div>

          <div className="prompt-block rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border">
              <span className="label-tech text-muted-foreground">Prompt · EN</span>
              <CopyButton
                id={`en-${scene.scene}`}
                text={scene.promptEn}
                label="Copy"
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            </div>
            <p className="px-3.5 py-3.5 font-mono text-xs leading-relaxed text-foreground/85 break-words">
              {scene.promptEn}
            </p>
          </div>

          <div className="prompt-block rounded-lg overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-border">
              <span className="label-tech text-muted-foreground">คำสั่ง · TH</span>
              <CopyButton
                id={`th-${scene.scene}`}
                text={scene.promptTh}
                label="คัดลอก"
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            </div>
            <p className="px-3.5 py-3.5 text-sm leading-relaxed text-foreground/85 break-words">
              {scene.promptTh}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
