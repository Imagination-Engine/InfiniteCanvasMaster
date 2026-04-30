import { useState, useEffect, RefObject } from "react";

export function useAutoScroll(
  scrollAnchorRef?: RefObject<HTMLElement | null>,
  dependencies: any[] = [],
) {
  const [isAutoScrollEnabled, setAutoScrollEnabled] = useState(true);

  // Monitor the scroll anchor and its parent container
  useEffect(() => {
    if (!isAutoScrollEnabled || !scrollAnchorRef?.current) return;

    const target = scrollAnchorRef.current;
    const parent = target.parentElement;
    if (!parent) return;

    // Use ResizeObserver to detect when content height changes (streaming tokens)
    const observer = new ResizeObserver(() => {
      if (isAutoScrollEnabled) {
        // block: "end" ensures the bottom of the anchor is in view
        target.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });

    observer.observe(parent);

    // Initial scroll
    target.scrollIntoView({ behavior: "smooth", block: "end" });

    return () => observer.disconnect();
  }, [isAutoScrollEnabled, scrollAnchorRef, ...dependencies]);

  return {
    isAutoScrollEnabled,
    setAutoScrollEnabled,
  };
}
