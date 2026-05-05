// @ts-nocheck
import { useCallback } from "react";
import { useCanvasStore } from "../state/canvasStore";

export const useSpatialSearch = () => {
  const search = useCallback((query: string): string[] => {
    if (!query || query.trim() === "") return [];

    const lowerQuery = query.toLowerCase();
    const { objects } = useCanvasStore.getState();

    return Object.values(objects)
      .filter((obj) => {
        // Build a searchable string from the object's properties
        let searchableText = `${obj.type} ${(obj as any).blockKind || ""} `;

        if ((obj as any).data) {
          const data = (obj as any).data;
          if (data.content) searchableText += `${data.content} `;
          if (data.role) searchableText += `${data.role} `;
        }

        if (obj.metadata) {
          searchableText += Object.values(obj.metadata).join(" ") + " ";
        }

        return searchableText.toLowerCase().includes(lowerQuery);
      })
      .map((obj) => obj.id);
  }, []);

  return { search };
};
