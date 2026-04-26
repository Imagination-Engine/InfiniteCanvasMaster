import { useState, useCallback } from "react";

export function useToolDisclosure(initialState = false) {
  const [isExpanded, setIsExpanded] = useState(initialState);
  const [viewMode, setViewMode] = useState<"human" | "developer">("human");

  const toggleExpanded = useCallback(() => setIsExpanded((prev) => !prev), []);
  const setHumanView = useCallback(() => setViewMode("human"), []);
  const setDeveloperView = useCallback(() => setViewMode("developer"), []);

  return {
    isExpanded,
    toggleExpanded,
    viewMode,
    setHumanView,
    setDeveloperView,
  };
}
