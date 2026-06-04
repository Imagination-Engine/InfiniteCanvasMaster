import { execSync, spawnSync } from "node:child_process";

function hasBun() {
  try {
    execSync("bun --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!hasBun()) {
  console.log(
    "[@iem/desktop] Skipping build (bun not installed; Electrobun stretch goal)",
  );
  process.exit(0);
}

const result = spawnSync("bun", ["run", "bun.build.ts"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
