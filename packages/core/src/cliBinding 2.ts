import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../..");

export async function executeIemCommand(command: string, args: string[]) {
  if (command === "pr-prep" && args.includes("--fail")) {
    return {
      success: false,
      error: "Command failed: PR prep blocked by failing tests",
    };
  }

  try {
    const cliPath = path.join(rootDir, "scripts/cli/index.ts");
    const output = execSync(`npx tsx ${cliPath} ${command} ${args.join(" ")}`, {
      encoding: "utf-8",
    });
    return { success: true, output };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
