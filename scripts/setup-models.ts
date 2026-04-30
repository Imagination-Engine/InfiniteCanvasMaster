import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export function parseConfig(configPath: string): string[] {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found at ${configPath}`);
  }
  const content = fs.readFileSync(configPath, 'utf8');
  try {
    const config = JSON.parse(content);
    if (!config.models || !Array.isArray(config.models)) {
      throw new Error('Config must contain a "models" array.');
    }
    return config.models;
  } catch (e: any) {
    throw new Error(`Failed to parse config: ${e.message}`);
  }
}

export function checkOllamaDaemon() {
  try {
    execSync('curl -s http://localhost:11434/', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

export function pullModel(model: string) {
  console.log(`[🚀] Pulling model: ${model}... This may take a while.`);
  try {
    // Inherit stdio to show the native ollama progress bar
    execSync(`ollama pull ${model}`, { stdio: 'inherit' });
    console.log(`[✅] Successfully pulled: ${model}`);
  } catch (e: any) {
    console.error(`[❌] Failed to pull ${model}:`, e.message);
  }
}

// Only execute the CLI script if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const configPath = path.join(__dirname, '../models.json');

  try {
    console.log('Reading model configuration...');
    const models = parseConfig(configPath);
    console.log(`Target models: ${models.join(', ')}`);

    console.log('Checking Ollama daemon...');
    if (!checkOllamaDaemon()) {
      console.error('❌ Ollama daemon is not running. Please start Ollama (http://localhost:11434) and try again.');
      process.exit(1);
    }
    console.log('✅ Ollama is running.');

    for (const model of models) {
      pullModel(model);
    }
    
    console.log('\n🎉 All requested models have been processed.');
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}