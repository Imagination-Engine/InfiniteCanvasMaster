// @ts-nocheck
import React from "react";
import { BaseCanvasObject } from "../contracts";

interface StreamingBlockProps {
  block: BaseCanvasObject & { data?: any };
  children?: React.ReactNode;
}

export const StreamingBlock: React.FC<StreamingBlockProps> = ({
  block,
  children,
}) => {
  const isStreaming = block.status === "streaming";
  const hasContent =
    block.data && block.data.content && block.data.content.length > 0;

  if (!isStreaming) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {hasContent ? (
        <>
          {children}
          {/* Progressive reveal indicator */}
          <div
            className="streaming-indicator"
            style={{
              position: "absolute",
              bottom: "4px",
              right: "4px",
              width: "8px",
              height: "8px",
              backgroundColor: "#9333ea",
              borderRadius: "50%",
              animation: "pulse 1s infinite",
            }}
          />
        </>
      ) : (
        /* Empty skeleton preserving space */
        <div
          className="streaming-skeleton"
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            border: "2px dashed #d1d5db",
          }}
        />
      )}
    </div>
  );
};
