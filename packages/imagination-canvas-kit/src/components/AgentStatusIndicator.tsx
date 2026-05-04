import React from "react";

export type AgentStatus = "thinking" | "generating" | "waiting" | string;

interface AgentStatusIndicatorProps {
  status: AgentStatus;
}

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({
  status,
}) => {
  const getSemanticColor = (status: AgentStatus) => {
    switch (status) {
      case "thinking":
        return "var(--color-agent-thinking)";
      case "generating":
        return "var(--color-agent-generating)";
      case "waiting":
        return "var(--color-agent-waiting)";
      default:
        return "gray";
    }
  };

  return (
    <div
      className="agent-status-indicator"
      style={{
        width: "12px",
        height: "12px",
        borderRadius: "var(--radius-pill, 9999px)",
        backgroundColor: getSemanticColor(status),
        transition: "background-color var(--ease-cinematic, 0.3s) ease",
        boxShadow: "var(--shadow-floating)",
      }}
      aria-label={`Agent status: ${status}`}
    />
  );
};
