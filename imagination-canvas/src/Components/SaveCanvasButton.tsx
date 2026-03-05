import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { Save } from "lucide-react";
import type { UnifiedCanvasDocument } from "../nodes/canvasTypes";

type SaveCanvasButtonProps = {
  onSave?: (document: UnifiedCanvasDocument) => Promise<void> | void;
};

export default function SaveCanvasButton({ onSave }: SaveCanvasButtonProps) {
  const { toObject } = useReactFlow();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const handleSave = async () => {
    setStatus("saving");

    const rawReactFlowState = toObject() as unknown as UnifiedCanvasDocument;

    try {
      if (onSave) {
        await onSave(rawReactFlowState);
      } else {
        console.log("Saving Canvas:", JSON.stringify(rawReactFlowState, null, 2));
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save canvas", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <button
      onClick={() => void handleSave()}
      disabled={status === "saving"}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-900 disabled:pointer-events-none disabled:opacity-70"
    >
      <Save className="h-4 w-4" />
      {status === "idle"
        ? "Save Canvas Data"
        : status === "saving"
          ? "Saving..."
          : status === "saved"
            ? "Saved"
            : "Error"}
    </button>
  );
}
