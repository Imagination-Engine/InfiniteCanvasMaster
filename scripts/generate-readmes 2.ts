import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const directories = [
  "apps/web",
  "apps/server",
  "packages/core",
  "packages/db",
  "packages/ui",
  "packages/surface-playable",
  "packages/surface-conductor",
  "packages/surface-reel",
  "packages/surface-forge",
  "packages/surface-atlas",
];

function generateTemplate(dirName: string) {
  const title = dirName.split("/").pop();
  return `# ${title}

## Description
<!-- What lives here and why -->
Provide a brief description of this package/app.

## How to use this
<!-- Setup, commands, and expected inputs/outputs -->
Describe how to interact with this module.

## Links
<!-- Links to adjacent/relevant files -->
- [Agent Primer](../../AGENTS.md)
`;
}

for (const dir of directories) {
  const fullPath = path.join(rootDir, dir);
  const readmePath = path.join(fullPath, "README.md");

  if (fs.existsSync(fullPath) && !fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, generateTemplate(dir));
    console.log(`Created ${readmePath}`);
  }
}
