import { execSync } from "child_process";
import path from "path";

const rootDir = "/Users/zacharyschenkler/icmaster";

try {
  console.log("Running pnpm iem:eval...");
  execSync("pnpm iem:eval", { stdio: "inherit", cwd: rootDir });
  console.log("SUCCESS");
} catch (error: any) {
  console.error("ERROR OCCURRED:");
  console.error("Message:", error.message);
  console.error("Status:", error.status);
  console.error("Signal:", error.signal);
}
