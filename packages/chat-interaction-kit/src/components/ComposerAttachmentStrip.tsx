import React from "react";
import { FileImage, X } from "lucide-react";
import type { ComposerAttachment } from "../utils/composerAttachments";

export type ComposerAttachmentStripProps = {
  attachments: ComposerAttachment[];
  onRemove: (id: string) => void;
  className?: string;
};

export const ComposerAttachmentStrip: React.FC<
  ComposerAttachmentStripProps
> = ({ attachments, onRemove, className = "" }) => {
  if (attachments.length === 0) return null;

  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto custom-scrollbar ${className}`}
      aria-label="Staged attachments"
    >
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}
          title={attachment.file.name}
        >
          {attachment.kind === "image" ? (
            <img
              src={attachment.previewUrl}
              alt={attachment.file.name}
              style={{
                width: 64,
                height: 64,
                objectFit: "cover",
                borderRadius: 12,
                display: "block",
              }}
              className="border border-white/30 bg-white/5"
              width={64}
              height={64}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                overflow: "hidden",
              }}
              className="border border-white/15 bg-white/5 flex flex-col items-center justify-center gap-1 px-1"
            >
              <FileImage size={18} className="text-white/50 shrink-0" />
              <span className="text-[8px] text-white/40 truncate max-w-full px-1">
                {attachment.file.name}
              </span>
            </div>
          )}

          <button
            type="button"
            aria-label={`Remove ${attachment.file.name}`}
            onClick={() => onRemove(attachment.id)}
            style={{ position: "absolute", top: 4, right: 4, zIndex: 10 }}
            className="w-5 h-5 rounded-full bg-black/90 border border-white/40 text-white hover:bg-rose-600 hover:border-rose-400 flex items-center justify-center shadow-md"
          >
            <X size={11} strokeWidth={2.5} />
          </button>
        </div>
      ))}
    </div>
  );
};
