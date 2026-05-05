import React, { forwardRef, useRef } from "react";
import { useGrowingTextarea } from "../hooks/useGrowingTextarea";
import { Plus } from "lucide-react";

interface GrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxHeight?: number;
  onEnter?: () => void;
  onFileSelect?: (files: FileList) => void;
  actions?: React.ReactNode;
}

export const GrowingTextarea = forwardRef<
  HTMLTextAreaElement,
  GrowingTextareaProps
>(
  (
    {
      value,
      maxHeight = 200,
      onEnter,
      onFileSelect,
      actions,
      className: externalClassName,
      ...props
    },
    ref,
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const resolvedRef = (ref ||
      internalRef) as React.RefObject<HTMLTextAreaElement>;
    const fileInputRef = useRef<HTMLInputElement>(null);

    useGrowingTextarea(resolvedRef, value, maxHeight);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onEnter?.();
      }
      props.onKeyDown?.(e);
    };

    return (
      <div className="relative flex items-center w-full bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-cyan/50 focus-within:bg-white/10 transition-all p-1">
        {/* Left Action: Upload */}
        <div className="flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          >
            <Plus size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => e.target.files && onFileSelect?.(e.target.files)}
            multiple
          />
        </div>

        {/* Center: Textarea */}
        <textarea
          ref={resolvedRef}
          value={value}
          rows={1}
          placeholder={props.placeholder}
          className={`flex-1 bg-transparent border-none focus:outline-none resize-none py-2 px-2 text-white placeholder:text-white/30 text-[13px] leading-relaxed min-h-[36px] ${externalClassName || ""}`}
          onKeyDown={handleKeyDown}
          {...props}
        />

        {/* Right Actions: Submit, etc. */}
        {actions && (
          <div className="flex items-center justify-center shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  },
);
GrowingTextarea.displayName = "GrowingTextarea";
