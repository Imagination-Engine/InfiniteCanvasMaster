import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function safeExec(command: string) {
  try {
    return execSync(command, { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    return null;
  }
}

async function run() {
  console.log('=== IEM PR-PREP SEQUENCE ===');

  console.log('\n--- STEP 1: LINTING ---');
  const lintResult = safeExec('pnpm lint');
  if (lintResult === null) {
    console.error('❌ Linting failed.');
  } else {
    console.log('✅ Linting passed.');
  }

  console.log('\n--- STEP 2: TYPE CHECKING ---');
  const typecheckResult = safeExec('pnpm typecheck');
  if (typecheckResult === null) {
    console.error('❌ Type checking failed.');
  } else {
    console.log('✅ Type checking passed.');
  }

  console.log('\n--- STEP 3: TESTING ---');
  const testResult = safeExec('pnpm test');
  if (testResult === null) {
    console.error('❌ Tests failed.');
  } else {
    console.log('✅ Tests passed.');
  }

  console.log('\n--- STEP 4: EVALUATIONS ---');
  const evalResult = safeExec('pnpm iem:eval');
  if (evalResult === null) {
    console.error('❌ Evals failed. Agent logic degraded.');
  } else {
    console.log('✅ Evals passed. Agent blueprint generation is stable.');
  }

  console.log('\n--- STEP 5: SCANNING FOR TODO/FIXME ---');
  try {
    const todos = execSync('grep -rE "TODO|FIXME" apps packages scripts --exclude-dir=node_modules --exclude-dir=dist || true', { encoding: 'utf8' });
    if (todos.trim()) {
      console.warn('⚠️ Found TODOs/FIXMEs:');
      console.log(todos);
    } else {
      console.log('✅ No TODOs/FIXMEs found.');
    }
  } catch (err) {
    console.log('✅ No TODOs/FIXMEs found.');
  }

  console.log('\n--- STEP 5: VERIFYING READMES ---');
  const criticalReadmes = [
    'README.md',
    'apps/web/README.md',
    'apps/server/README.md',
    'packages/core/README.md',
    'packages/db/README.md',
    'conductor/README.md'
  ];
  let readmeMissing = false;
  for (const r of criticalReadmes) {
    if (!fs.existsSync(path.join(rootDir, r))) {
      console.warn(`⚠️ Missing critical README: ${r}`);
      readmeMissing = true;
    }
  }
  if (!readmeMissing) console.log('✅ All critical READMES present.');

  console.log('\n=== PR-PREP COMPLETE ===');
  console.log('If all steps above are green (or acceptable yellows), you are ready to commit.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
