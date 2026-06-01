import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

export function checkRotationDue() {
  const logPath = path.join(rootDir, "docs/security/rotation-log.md");
  if (!fs.existsSync(logPath)) {
    console.error("Rotation log not found.");
    return;
  }

  const content = fs.readFileSync(logPath, "utf8");
  const lines = content.split("\n");
  const now = new Date();

  console.log("--- Rotation Status ---");
  let issuesFound = false;

  for (const line of lines) {
    if (
      line.startsWith("|") &&
      !line.includes("Service") &&
      !line.includes(":---")
    ) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 6) {
        const service = parts[1];
        const lastRotatedStr = parts[4];

        try {
          const lastRotated = new Date(lastRotatedStr);
          const diffTime = Math.abs(now.getTime() - lastRotated.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 90) {
            console.log(
              `[WARNING] ${service} last rotated ${diffDays} days ago (exceeds 90 days).`,
            );
            issuesFound = true;
          } else {
            console.log(`[OK] ${service} last rotated ${diffDays} days ago.`);
          }
        } catch (e) {
          console.log(`[ERROR] Could not parse date for ${service}`);
        }
      }
    }
  }

  if (issuesFound) {
    process.exit(1);
  }
}

// Only execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkRotationDue();
}
