import React from "react";

export type HandlePosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "bottom"
  | "left"
  | "right";

interface TransformHandleProps {
  position: HandlePosition;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const TransformHandle: React.FC<TransformHandleProps> = ({
  position,
  onDragStart,
}) => {
  // Positioning logic based on the 44px wrapper to keep the *center* of the wrapper
  // exactly on the corner/edge of the element.
  const getPositionStyles = (): React.CSSProperties => {
    const offset = "-22px"; // Half of 44px
    switch (position) {
      case "top-left":
        return { top: offset, left: offset, cursor: "nwse-resize" };
      case "top-right":
        return { top: offset, right: offset, cursor: "nesw-resize" };
      case "bottom-left":
        return { bottom: offset, left: offset, cursor: "nesw-resize" };
      case "bottom-right":
        return { bottom: offset, right: offset, cursor: "nwse-resize" };
      case "top":
        return {
          top: offset,
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "ns-resize",
        };
      case "bottom":
        return {
          bottom: offset,
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "ns-resize",
        };
      case "left":
        return {
          left: offset,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "ew-resize",
        };
      case "right":
        return {
          right: offset,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "ew-resize",
        };
    }
  };

  return (
    <div
      className="transform-handle-wrapper"
      style={{
        position: "absolute",
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        ...getPositionStyles(),
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      <div
        className="visible-handle"
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "#ffffff",
          border: "2px solid #3b82f6",
          borderRadius: "50%",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
};
