import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

export function runNpmAudit(): string {
  try {
    const output = execSync("pnpm audit --json", {
      cwd: rootDir,
      encoding: "utf-8",
    });
    const json = JSON.parse(output);
    return `Found ${json.metadata?.vulnerabilities?.total || 0} vulnerabilities.`;
  } catch (e: any) {
    // pnpm audit exits with non-zero if vulnerabilities are found
    if (e.stdout) {
      try {
        const json = JSON.parse(e.stdout);
        const vulns = json.metadata?.vulnerabilities;
        return `Found vulnerabilities: High (${vulns.high}), Moderate (${vulns.moderate}), Low (${vulns.low})`;
      } catch {
        return "Failed to parse audit results.";
      }
    }
    return "Audit failed to run.";
  }
}

export function queryAuthEvents(): string {
  // In a real environment, this would use Drizzle to query the DB.
  // For the CLI generation stub, we return placeholder text.
  return `Simulated query: 124 login_success, 3 login_failure events recorded.`;
}

export function generateReport(
  auditResult: string,
  authResult: string,
): string {
  const date = new Date().toISOString().split("T")[0];
  return `# Security Audit Report - ${date}\n\n## NPM Audit\n${auditResult}\n\n## Auth Events\n${authResult}\n`;
}

// Only execute the CLI script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running Security Audit...");

  const auditResult = runNpmAudit();
  const authResult = queryAuthEvents();

  const reportContent = generateReport(auditResult, authResult);

  // Calculate week number roughly
  const weekNumber = Math.ceil(new Date().getDate() / 7);
  const outDir = path.join(rootDir, "docs/security/audit");
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `week-${weekNumber}.md`);
  fs.writeFileSync(outPath, reportContent);

  console.log(`Report generated at ${outPath}`);
}
