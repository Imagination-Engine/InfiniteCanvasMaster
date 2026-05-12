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
export declare function classifyOrchestratorIntent(
  input: string,
): OrchestratorUserIntent;
//# sourceMappingURL=orchestratorIntentClassifier.d.ts.map
