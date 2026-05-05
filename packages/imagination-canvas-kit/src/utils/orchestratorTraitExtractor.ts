/**
 * Utility to extract agent traits (role, description) from natural language.
 */
export function extractAgentTraits(input: string) {
  const normalized = input.toLowerCase().trim();

  let role: string | null = null;
  let description: string | null = null;

  // 1. Try to find role
  // Pattern: [a|an] [role] agent
  const roleMatch = normalized.match(/(?:a|an)\s+([a-z-]+)\s+agent/);
  if (roleMatch) {
    role = roleMatch[1];
  }

  // 2. Try to find description
  // Pattern: agent [that|to] [description]
  const descMatch = normalized.match(/agent\s+(?:that|to|who)\s+(.*)/);
  if (descMatch) {
    description = descMatch[1].trim();
  }

  return {
    role,
    description,
  };
}
