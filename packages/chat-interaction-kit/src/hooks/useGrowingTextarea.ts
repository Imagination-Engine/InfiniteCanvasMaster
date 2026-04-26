import { useEffect, RefObject } from "react";

export function useGrowingTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight: number = 200,
) {
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to compute actual scrollHeight
    textarea.style.height = "0px";
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = "hidden";
    }
  }, [value, maxHeight, textareaRef]);
}
