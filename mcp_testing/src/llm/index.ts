import db from '../db';
import { LLMConfig, Workspace } from '../types';
import { OllamaProvider, OpenAIProvider, GeminiProvider, ILLMProvider } from './providers';

export class LLMService {
    private static providers: Record<string, ILLMProvider> = {
        ollama: new OllamaProvider(),
        openai: new OpenAIProvider(),
        gemini: new GeminiProvider()
    };

    static async generateText(workspace_id: string, input: string): Promise<string> {
        const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspace_id) as any;
        if (!workspace) throw new Error('Workspace not found');

        if (!workspace.config) {
            throw new Error('LLM not configured for this workspace');
        }

        const config = JSON.parse(workspace.config) as LLMConfig;
        const provider = this.providers[config.provider];

        if (!provider) {
            throw new Error(`Unsupported LLM provider: ${config.provider}`);
        }

        // Warning system for external APIs
        if (config.provider === 'openai' || config.provider === 'gemini') {
            console.warn(`\n[WARNING] Workspace ${workspace_id} is using an EXTERNAL API provider: ${config.provider.toUpperCase()}`);
            console.warn(`[WARNING] This will send data and consume credits/usage on that platform.\n`);
        }

        try {
            const result = await provider.generateText(input, config);
            return result;
        } catch (err: any) {
            console.error(`[LLMService] Provider error (${config.provider}):`, err.message);
            throw err;
        }
    }

    static async analyzeImage(workspace_id: string, prompt: string, imageBase64: string): Promise<string> {
        const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspace_id) as any;
        if (!workspace) throw new Error('Workspace not found');

        if (!workspace.config) {
            throw new Error('LLM not configured for this workspace');
        }

        const config = JSON.parse(workspace.config) as LLMConfig;
        const provider = this.providers[config.provider];

        if (!provider) {
            throw new Error(`Unsupported LLM provider: ${config.provider}`);
        }

        try {
            return await provider.analyzeImage(prompt, imageBase64, config);
        } catch (err: any) {
            console.error(`[LLMService] Vision error (${config.provider}):`, err.message);
            throw err;
        }
    }
}
