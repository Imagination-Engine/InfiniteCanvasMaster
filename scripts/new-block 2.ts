import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";
import readline from "readline";
import {
  blockTemplate,
  blockTestTemplate,
  viewTemplate,
  viewTestTemplate,
} from "./templates/blockTemplates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const program = new Command();

program
  .option(
    "--surface <surface>",
    "The surface to generate the block in (e.g., scribe, playable)",
  )
  .option("--id <id>", "The camelCase ID of the block (e.g., myNewBlock)")
  .option(
    "--name <name>",
    "The Title Case name of the block (e.g., My New Block)",
  )
  .option("--category <category>", "The category of the block")
  .parse(process.argv);

const options = program.opts();

async function ask(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      `${question}${defaultValue ? ` (${defaultValue})` : ""}: `,
      (answer) => {
        rl.close();
        resolve(answer || defaultValue || "");
      },
    );
  });
}

async function run() {
  let { surface, id, name, category } = options;

  if (!surface)
    surface = await ask(
      "Surface (scribe, playable, conductor, reel, forge, atlas)",
      "conductor",
    );
  if (!id) id = await ask("Block ID (camelCase, e.g., textRefiner)");
  if (!name) name = await ask("Human Name (Title Case, e.g., Text Refiner)");
  if (!category)
    category = await ask("Category (text, image, data, etc.)", "text");

  if (!surface || !id || !name) {
    console.error("Error: Surface, ID, and Name are required.");
    process.exit(1);
  }

  const PascalName = name.replace(/\s+/g, "");
  const targetDir = path.join(
    rootDir,
    "packages",
    `surface-${surface}`,
    "src",
    "blocks",
    id,
  );

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Block directory ${targetDir} already exists.`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  function replaceTokens(template: string) {
    return template
      .replace(/\{\{id\}\}/g, id)
      .replace(/\{\{name\}\}/g, PascalName)
      .replace(/\{\{surface\}\}/g, surface)
      .replace(/\{\{category\}\}/g, category);
  }

  fs.writeFileSync(
    path.join(targetDir, `${id}Block.ts`),
    replaceTokens(blockTemplate),
  );
  fs.writeFileSync(
    path.join(targetDir, `${id}Block.test.ts`),
    replaceTokens(blockTestTemplate),
  );
  fs.writeFileSync(
    path.join(targetDir, `${PascalName}View.tsx`),
    replaceTokens(viewTemplate),
  );
  fs.writeFileSync(
    path.join(targetDir, `${PascalName}View.test.tsx`),
    replaceTokens(viewTestTemplate),
  );

  // Update registry if it exists in the surface
  const registryPath = path.join(
    rootDir,
    "packages",
    `surface-${surface}`,
    "src",
    "blocks",
    "index.ts",
  );
  if (fs.existsSync(registryPath)) {
    let content = fs.readFileSync(registryPath, "utf8");
    const exportLine = `export * from './${id}/${id}Block';\n`;
    if (!content.includes(exportLine)) {
      content += exportLine;
      fs.writeFileSync(registryPath, content);
    }
  }

  console.log(`
🚀 Successfully generated block ${PascalName}!
📍 Location: packages/surface-${surface}/src/blocks/${id}
🧪 To test: pnpm --filter surface-${surface} test
  `);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
