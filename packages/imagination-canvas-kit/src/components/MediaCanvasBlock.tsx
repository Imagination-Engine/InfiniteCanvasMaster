// @ts-nocheck
import React, { useCallback } from "react";
import { BaseCanvasObject } from "../contracts";

interface MediaCanvasBlockProps {
  block: BaseCanvasObject & { data?: any };
}

export const MediaCanvasBlock: React.FC<MediaCanvasBlockProps> = ({
  block,
}) => {
  const { data } = block;

  const stopPropagation = useCallback(
    (
      e:
        | React.WheelEvent
        | React.TouchEvent
        | React.MouseEvent
        | React.PointerEvent,
    ) => {
      // Stop propagation so the canvas doesn't pan or zoom when interacting with media
      e.stopPropagation();
    },
    [],
  );

  const renderContent = () => {
    if (!data) return <div>Empty Media</div>;

    if (data.type === "image") {
      return (
        <img
          src={data.url}
          alt="embedded media"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      );
    }

    if (data.type === "embed") {
      return (
        <iframe
          src={data.url}
          style={{ width: "100%", height: "100%", border: "none" }}
          title="embed"
        />
      );
    }

    return <div>Unsupported Media Type</div>;
  };

  return (
    <div
      onWheel={stopPropagation}
      onPointerDown={stopPropagation}
      onPointerMove={stopPropagation}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        overflow: "hidden",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      {renderContent()}
    </div>
  );
};
