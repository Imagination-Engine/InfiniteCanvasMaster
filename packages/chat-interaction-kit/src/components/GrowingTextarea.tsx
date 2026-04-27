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
    { value, maxHeight = 200, onEnter, onFileSelect, actions, ...props },
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
      <div
        className="relative flex items-center w-full bg-white/10 border border-white/20 rounded-full focus-within:border-brand-cyan/50 focus-within:bg-white/15 transition-all px-2"
        style={{ minHeight: "60px" }}
      >
        {/* Left Action: Upload */}
        <div className="flex items-center justify-center pl-2 pr-1 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <Plus size={24} />
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
          className={`flex-1 bg-transparent border-none focus:outline-none resize-none py-4 px-2 text-white placeholder:text-white/40 text-base leading-normal ${props.className || ""}`}
          onKeyDown={handleKeyDown}
          style={{ height: "auto", minHeight: "24px" }}
          {...props}
        />

        {/* Right Actions: Submit, etc. */}
        {actions && (
          <div className="flex items-center justify-center pr-2 pl-1 shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  },
);
GrowingTextarea.displayName = "GrowingTextarea";
