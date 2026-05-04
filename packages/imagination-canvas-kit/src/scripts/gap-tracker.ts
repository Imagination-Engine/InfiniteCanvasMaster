export interface GapEntry {
  id: string;
  title: string;
  surface: string;
  severity: string;
  status: string;
  owner: string;
  requiredFix: string;
  acceptanceCriteria: string;
  testFile?: string;
}

export function parseGapList(markdown: string): GapEntry[] {
  const gaps: GapEntry[] = [];
  const lines = markdown.split("\n");

  let currentGap: Partial<GapEntry> | null = null;

  for (const line of lines) {
    const titleMatch = line.match(/^###\s*(GAP-\d+):\s*(.*)$/);
    if (titleMatch) {
      if (currentGap) {
        validateGap(currentGap);
        gaps.push(currentGap as GapEntry);
      }
      currentGap = { id: titleMatch[1].trim(), title: titleMatch[2].trim() };
      continue;
    }

    if (currentGap) {
      const fieldMatch = line.match(/^-\s*\*\*(.*?):\*\*\s*(.*)$/);
      if (fieldMatch) {
        let rawKey = fieldMatch[1].toLowerCase();
        let parts = rawKey.split(" ");
        let key = parts[0];
        for (let i = 1; i < parts.length; i++) {
          key += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }

        const value = fieldMatch[2].trim();
        (currentGap as any)[key] = value;
      }
    }
  }

  if (currentGap) {
    validateGap(currentGap);
    gaps.push(currentGap as GapEntry);
  }

  return gaps;
}

function validateGap(gap: Partial<GapEntry>) {
  const required = [
    "id",
    "title",
    "surface",
    "severity",
    "status",
    "owner",
    "requiredFix",
    "acceptanceCriteria",
  ];
  for (const req of required) {
    if (!gap[req as keyof GapEntry]) {
      throw new Error(
        `Missing required fields: ${req} in ${gap.id || "Unknown GAP"}`,
      );
    }
  }
}
