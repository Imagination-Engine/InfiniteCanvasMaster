// @ts-nocheck
import React, { useEffect, useRef } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import { useCanvasStore } from "../../state/canvasStore";

/**
 * Rich Text Block component.
 * Reactive to metadata.content and metadata.text updates.
 */
export const RichTextBlock: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
}) => {
  const updateObject = useCanvasStore((s) => s.updateObject);
  const editorRef = useRef<HTMLDivElement>(null);
  const isImmersive = mode === "fullscreen" || mode === "side-panel";

  // Current text from metadata
  const externalContent =
    (object.metadata?.content as string) ||
    (object.metadata?.text as string) ||
    "";

  // Sync DOM with store updates (e.g. from an Agent)
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerText !== externalContent) {
        editorRef.current.innerText = externalContent;
      }
    }
  }, [externalContent]);

  const handleBlur = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerText;
      updateObject(object.id, {
        metadata: {
          content: newContent,
          text: newContent,
        },
      });
    }
  };

  if (isImmersive) {
    return (
      <div className="h-full flex flex-col p-8 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase tracking-widest text-white">
              Rich Text Surface
            </h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
              Active Drafting Node
            </p>
          </div>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className="flex-1 w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-lg text-white/90 outline-none focus:border-brand-purple/50 transition-all overflow-y-auto custom-scrollbar leading-relaxed shadow-2xl"
          onBlur={handleBlur}
          suppressContentEditableWarning
          placeholder="Start typing or let an agent populate this surface..."
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-1">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2 px-1">
        Draft Output
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="flex-1 w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-xs text-white/80 outline-none focus:border-brand-purple/40 transition-all overflow-y-auto custom-scrollbar leading-relaxed"
        onBlur={handleBlur}
        suppressContentEditableWarning
      />
    </div>
  );
};
