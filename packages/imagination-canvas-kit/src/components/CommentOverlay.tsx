// @ts-nocheck
import React from "react";
import { useCanvasStore } from "../state/canvasStore";

export const CommentOverlay: React.FC = () => {
  const { objects, bindings } = useCanvasStore();

  // Find all objects of type 'comment' that have a binding to another object
  const comments = Object.values(objects).filter(
    (obj) =>
      obj.type === "comment" && bindings.some((b) => b.sourceId === obj.id),
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="canvas-comment"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${comment.x}px, ${comment.y}px)`,
            width: comment.width,
            height: comment.height,
            backgroundColor: "#fffae6",
            border: "1px solid #fcd34d",
            borderRadius: "4px",
            padding: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            pointerEvents: "auto", // Allow interacting with the comment itself
            transition: "transform 0.1s linear", // Match parent movements smoothly
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#b45309",
              marginBottom: "4px",
            }}
          >
            {comment.data?.author || "Unknown"}
          </div>
          <div style={{ fontSize: "12px", color: "#333" }}>
            {comment.data?.text}
          </div>
        </div>
      ))}
    </div>
  );
};
