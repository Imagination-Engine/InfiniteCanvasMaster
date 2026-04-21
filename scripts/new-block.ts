import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { blockTemplate, blockTestTemplate, viewTemplate, viewTestTemplate } from './templates/blockTemplates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const program = new Command();

program
  .requiredOption('--surface <surface>', 'The surface to generate the block in (e.g., scribe, playable)')
  .requiredOption('--id <id>', 'The camelCase ID of the block (e.g., myNewBlock)')
  .requiredOption('--name <name>', 'The Title Case name of the block (e.g., My New Block)')
  .parse(process.argv);

const options = program.opts();
const { surface, id, name } = options;
const PascalName = name.replace(/\s+/g, '');

const targetDir = path.join(rootDir, 'packages', `surface-${surface}`, 'src', 'blocks', id);

if (fs.existsSync(targetDir)) {
  console.error(`Error: Block directory ${targetDir} already exists.`);
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });

function replaceTokens(template: string) {
  return template
    .replace(/\{\{id\}\}/g, id)
    .replace(/\{\{name\}\}/g, PascalName)
    .replace(/\{\{surface\}\}/g, surface);
}

fs.writeFileSync(path.join(targetDir, `${id}Block.ts`), replaceTokens(blockTemplate));
fs.writeFileSync(path.join(targetDir, `${id}Block.test.ts`), replaceTokens(blockTestTemplate));
fs.writeFileSync(path.join(targetDir, `${PascalName}View.tsx`), replaceTokens(viewTemplate));
fs.writeFileSync(path.join(targetDir, `${PascalName}View.test.tsx`), replaceTokens(viewTestTemplate));

console.log(`Successfully generated block ${PascalName} in packages/surface-${surface}/src/blocks/${id}`);
