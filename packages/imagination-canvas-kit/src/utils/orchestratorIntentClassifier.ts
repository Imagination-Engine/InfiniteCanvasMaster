export type OrchestratorUserIntent =
  | "emotional_expression"
  | "question"
  | "explain_canvas"
  | "modify_canvas"
  | "create_block"
  | "run_workflow"
  | "refine_block"
  | "plan_request"
  | "help_request"
  | "unknown";

/**
 * Lightweight intent classification engine for the Orchestrator.
 * Prioritizes high-energy emotional expression and actionable block creation.
 */
export function classifyOrchestratorIntent(
  input: string,
): OrchestratorUserIntent {
  const normalized = input.toLowerCase().trim();

  // 1. Create Block (High Action Priority)
  if (
    /add|create|drop|insert|give me|want a|need a/.test(normalized) &&
    /block|note|agent|studio|canvas|artifact|writer|writing/.test(normalized)
  ) {
    return "create_block";
  }

  // 2. Emotional Expression / Praise (Prioritize over questions if high energy)
  if (
    /awesome|cool|love|great|wow|amazing|nice|good job|thank you/.test(
      normalized,
    )
  ) {
    return "emotional_expression";
  }

  // 3. Plan Request
  if (/plan|blueprint|generate|strategy|outline|roadmap/.test(normalized)) {
    return "plan_request";
  }

  // 4. Questions
  if (/how|what|why|where|when|\?/.test(normalized)) {
    return "question";
  }

  // 5. Help Request
  if (/help|assist|support|guide/.test(normalized)) {
    return "help_request";
  }

  return "unknown";
}
