import React from "react";
import { FileImage } from "lucide-react";

export type MessageAttachmentPreviewItem = {
  id: string;
  previewUrl: string;
  name: string;
  kind: "image" | "file";
};

export const MessageAttachmentPreview: React.FC<{
  attachments: MessageAttachmentPreviewItem[];
}> = ({ attachments }) => {
  if (attachments.length === 0) return null;

  const thumbFrame =
    "h-16 w-16 min-h-16 min-w-16 max-h-16 max-w-16 shrink-0 flex-none";

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2 max-h-16 overflow-hidden">
      {attachments.map((attachment) =>
        attachment.kind === "image" ? (
          <div
            key={attachment.id}
            className={`${thumbFrame} overflow-hidden rounded-xl border border-white/15 bg-black/20`}
          >
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="block h-full w-full max-h-full max-w-full object-cover object-center"
              width={64}
              height={64}
            />
          </div>
        ) : (
          <div
            key={attachment.id}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-black/20 text-[11px] text-white/70"
          >
            <FileImage size={14} />
            <span className="truncate max-w-[200px]">{attachment.name}</span>
          </div>
        ),
      )}
    </div>
  );
};
