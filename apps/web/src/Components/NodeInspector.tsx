import { useEffect, useMemo, useState } from "react";
import { useEditor, useValue } from "tldraw";
import { NODE_CATALOG } from "../nodes/nodeCatalog";

export function NodeInspector() {
  const editor = useEditor();

  const selectedShapeIds = useValue(
    "selected-shapes",
    () => editor.getSelectedShapeIds(),
    [editor],
  );

  const selectedShape = useMemo(() => {
    if (selectedShapeIds.length !== 1) return null;
    return editor.getShape(selectedShapeIds[0]) as any;
  }, [editor, selectedShapeIds]);

  const isIemBlock = selectedShape?.type === "iem-block";

  const [label, setLabel] = useState<string>("");
  const [inputsText, setInputsText] = useState<string>("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Keep local form in sync when selection changes.
  useEffect(() => {
    if (!isIemBlock) return;
    setLabel(String(selectedShape.props?.label ?? ""));
    setInputsText(JSON.stringify(selectedShape.props?.inputs ?? {}, null, 2));
    setJsonError(null);
  }, [isIemBlock, selectedShape?.id]);

  if (!isIemBlock) return null;

  const blockId = String(selectedShape.props?.blockId ?? "unknown");
  const catalogEntry = NODE_CATALOG[blockId];
  const nodeId = selectedShape.meta?.iem?.nodeId || selectedShape.id;

  const apply = () => {
    let parsedInputs: any = undefined;
    try {
      parsedInputs = inputsText.trim() ? JSON.parse(inputsText) : {};
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e?.message || "Invalid JSON");
      return;
    }

    editor.updateShapes([
      {
        id: selectedShape.id,
        type: selectedShape.type,
        props: {
          ...selectedShape.props,
          label,
          inputs: parsedInputs,
        },
      },
    ]);
  };

  return (
    <div className="absolute left-4 top-4 z-[10010] w-[360px] max-w-[90vw] pointer-events-auto">
      <div className="rounded-2xl border border-white/10 bg-brand-bg-page/90 backdrop-blur-2xl shadow-2xl text-white overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              Node
            </div>
            <div className="font-semibold truncate">
              {label || "(untitled)"}
            </div>
            <div className="text-[11px] text-white/60 truncate">
              {catalogEntry?.label || blockId} · {String(nodeId)}
            </div>
          </div>
          <button
            onClick={apply}
            className="px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/15 border border-white/10"
          >
            Apply
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <label className="text-[11px] text-white/70 font-semibold">
            Label
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-brand-cyan/40 text-sm"
              placeholder="Node label"
            />
          </label>

          <label className="text-[11px] text-white/70 font-semibold">
            Inputs (JSON)
            <textarea
              value={inputsText}
              onChange={(e) => setInputsText(e.target.value)}
              className="mt-1 w-full h-40 px-3 py-2 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-brand-cyan/40 font-mono text-[11px]"
              spellCheck={false}
            />
          </label>
          {jsonError && (
            <div className="text-xs text-rose-300">JSON error: {jsonError}</div>
          )}
        </div>
      </div>
    </div>
  );
}
