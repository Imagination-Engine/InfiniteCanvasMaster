// @ts-nocheck
import React, { useState } from "react";
import type { BlockComponentProps } from "../../contracts/BlockRegistry";
import { useCanvasStore } from "../../state/canvasStore";
import { buildManuscriptArtifact } from "@iem/core";

export const NoteBlock: React.FC<BlockComponentProps> = ({
  object,
  mode = "compact",
}) => {
  const [text, setText] = useState((object.metadata.text as string) || "");
  const updateObject = useCanvasStore((s) => s.updateObject);
  const isImmersive = mode === "fullscreen" || mode === "side-panel";

  const externalText = (object.metadata.text as string) || "";

  React.useEffect(() => {
    if (externalText !== text) {
      setText(externalText);
    }
  }, [externalText]);

  const handleChange = (value: string) => {
    setText(value);
    const artifact = buildManuscriptArtifact(object.id, {
      title: (object.metadata?.label as string) || "Note",
      body: value,
      format: "plain",
    });
    updateObject(object.id, {
      metadata: {
        ...object.metadata,
        text: value,
        outputs: {
          ...(object.metadata?.outputs || {}),
          manuscript: artifact,
        },
      },
    });
  };

  if (!isImmersive) {
    return (
      <div className="w-full h-full">
        <textarea
          className="w-full h-full bg-transparent border-none focus:outline-none resize-none overflow-hidden text-[13px] text-white/90 placeholder:text-white/20 leading-relaxed font-medium"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type a note..."
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 max-w-3xl mx-auto w-full">
      <h2 className="text-lg font-black uppercase tracking-widest text-white mb-4">
        Note Editor
      </h2>
      <textarea
        className="flex-1 min-h-[400px] w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[15px] text-white/90 leading-relaxed resize-none focus:outline-none focus:border-brand-cyan/50"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Expand your thoughts…"
      />
    </div>
  );
};
