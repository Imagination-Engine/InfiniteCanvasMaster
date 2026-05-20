// @ts-nocheck
import {
  formatConnectableBlocksAnswer,
  buildBlockOrchestratorContext,
} from "@iem/core";

const CONNECT_QUESTION =
  /what can i connect|compatible blocks|what feeds|downstream|next step/i;

export function isConnectabilityQuestion(input: string): boolean {
  return CONNECT_QUESTION.test(input);
}

export function buildSuggestionChips(
  blockId: string | null | undefined,
): Array<{
  id: string;
  label: string;
}> {
  if (!blockId) return [];
  const ctx = buildBlockOrchestratorContext(blockId);
  if (!ctx) return [];
  return ctx.compatibleBlocks.map((b) => ({ id: b.id, label: b.name }));
}

export function buildMissingToolMountMessage(
  blockId: string | null | undefined,
): string | null {
  if (!blockId) return null;
  const ctx = buildBlockOrchestratorContext(blockId);
  if (!ctx?.missingToolMounts.length) return null;
  const names = ctx.missingToolMounts.map((m) => m.name).join(", ");
  return `This block needs tool mounts that are not configured yet: ${names}. Open Settings to add API keys.`;
}

export function resolveOrchestratorReply(
  input: string,
  blockId: string | null | undefined,
): string | null {
  if (isConnectabilityQuestion(input) && blockId) {
    return formatConnectableBlocksAnswer(blockId);
  }
  const mountMsg = buildMissingToolMountMessage(blockId);
  if (mountMsg && /tool|mount|configure|api key/i.test(input)) {
    return mountMsg;
  }
  return null;
}
