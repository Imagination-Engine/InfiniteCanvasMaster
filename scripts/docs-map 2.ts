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

function generateMap() {
  let mapContent = `# Semantic Document Map\n\nAuto-generated map of the Imagination Engine monorepo.\n\n`;

  for (const dir of directories) {
    const readmePath = path.join(rootDir, dir, "README.md");

    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, "utf8");
      const lines = content.split("\n");

      // Attempt to extract the first heading and description
      const titleLine =
        lines.find((line) => line.startsWith("# ")) || `# ${dir}`;
      const title = titleLine.replace("# ", "").trim();

      let description = "No description provided.";
      const descIndex = lines.findIndex((line) =>
        line.startsWith("## Description"),
      );
      if (descIndex !== -1 && lines.length > descIndex + 2) {
        // skip the comment line if it exists
        const potentialDesc = lines[descIndex + 2].trim();
        if (potentialDesc && !potentialDesc.startsWith("<!--")) {
          description = potentialDesc;
        } else if (lines.length > descIndex + 3) {
          description = lines[descIndex + 3].trim();
        }
      }

      mapContent += `### [${title}](../${dir}/README.md)\n`;
      mapContent += `- **Location:** \`${dir}\`\n`;
      mapContent += `- **Description:** ${description}\n\n`;
    } else {
      mapContent += `### ${dir}\n- **Warning:** Missing README.md\n\n`;
    }
  }

  const outPath = path.join(rootDir, "docs", "MAP.md");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, mapContent);
  console.log(`Generated Semantic Document Map at ${outPath}`);
}

generateMap();
