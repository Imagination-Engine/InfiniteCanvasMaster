import React from "react";
import { useAgentTaskStore } from "../state/agentTaskStore";
import { BaseCanvasObject } from "../contracts";

interface AgentCanvasBlockProps {
  block: BaseCanvasObject & { data?: any };
}

export const AgentCanvasBlock: React.FC<AgentCanvasBlockProps> = ({
  block,
}) => {
  const { tasks, updateTaskStatus } = useAgentTaskStore();

  // Find the most recent active task for this agent
  const activeTask = tasks.find(
    (t) =>
      t.agentId === block.id &&
      t.status !== "completed" &&
      t.status !== "failed",
  );

  const handleApprove = () => {
    if (activeTask) updateTaskStatus(activeTask.id, "running");
  };

  const handleReject = () => {
    if (activeTask) updateTaskStatus(activeTask.id, "failed");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "16px",
        border: "2px solid #9333ea",
        borderRadius: "8px",
        backgroundColor: "#faf5ff",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <h3 style={{ margin: 0, color: "#6b21a8" }}>Agent</h3>
      <p style={{ margin: 0, fontWeight: "bold" }}>
        {block.data?.role || "Assistant"}
      </p>

      {activeTask && (
        <div
          style={{
            marginTop: "auto",
            padding: "8px",
            backgroundColor: "white",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "12px", marginBottom: "4px" }}>
            Status: {activeTask.status}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            Intent: {activeTask.intent}
          </div>

          {activeTask.status === "waiting-for-user" && (
            <div
              style={{
                marginTop: "8px",
                borderTop: "1px solid #eee",
                paddingTop: "8px",
              }}
            >
              <strong
                style={{
                  color: "#d97706",
                  fontSize: "12px",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Approval Required
              </strong>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleApprove}
                  style={{
                    flex: 1,
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px",
                  }}
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  style={{
                    flex: 1,
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "4px",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
