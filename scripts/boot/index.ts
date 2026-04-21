import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function safeRead(filePath: string): string {
  try {
    return fs.readFileSync(path.join(rootDir, filePath), 'utf-8');
  } catch (e) {
    return `[Warning: Could not read ${filePath}]`;
  }
}

function safeExec(command: string): string {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8' });
  } catch (e) {
    return `[Warning: Command failed: ${command}]`;
  }
}

console.log('=== IMAGINATION ENGINE BOOT SEQUENCE ===\n');

console.log('--- STAGE 1: IDENTITY ---');
console.log(safeRead('AGENTS.md').substring(0, 500) + '...\n');

console.log('--- STAGE 2: SYSTEM RULES ---');
const rulesDir = path.join(rootDir, '.agent/rules');
if (fs.existsSync(rulesDir)) {
  const rules = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${rules.length} rule files: ${rules.join(', ')}\n`);
} else {
  console.log('[Warning: No .agent/rules directory found]\n');
}

console.log('--- STAGE 3: GIT CONTEXT ---');
console.log('Recent Commits:');
console.log(safeExec('git log -n 3 --oneline'));
console.log('Current Status:');
console.log(safeExec('git status --short') || 'Clean tree\n');

console.log('--- STAGE 4: TRIAGE BACKLOG ---');
console.log(safeRead('docs/backlog/TRIAGE.md').substring(0, 500) + '...\n');

console.log('=== BOOT SEQUENCE COMPLETE ===');
