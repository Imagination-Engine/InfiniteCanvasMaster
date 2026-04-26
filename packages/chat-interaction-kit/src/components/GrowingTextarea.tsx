import React, { forwardRef, useEffect } from "react";
import { useGrowingTextarea } from "../hooks/useGrowingTextarea";

interface GrowingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxHeight?: number;
  onEnter?: () => void;
}

export const GrowingTextarea = forwardRef<
  HTMLTextAreaElement,
  GrowingTextareaProps
>(({ value, maxHeight = 200, onEnter, ...props }, ref) => {
  // If no ref is passed, we create a local one just for the hook.
  // In a real app, you'd use useImperativeHandle or compose refs.
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  const resolvedRef = (ref ||
    internalRef) as React.RefObject<HTMLTextAreaElement>;

  useGrowingTextarea(resolvedRef, value, maxHeight);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
    props.onKeyDown?.(e);
  };

  return (
    <textarea
      ref={resolvedRef}
      value={value}
      rows={1}
      className={`w-full bg-transparent border-none focus:outline-none resize-none ${props.className || ""}`}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
});
GrowingTextarea.displayName = "GrowingTextarea";
