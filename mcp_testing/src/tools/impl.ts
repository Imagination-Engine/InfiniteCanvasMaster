import { ITool, ToolResult } from './types';
import { LLMService } from '../llm';
import db from '../db';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import * as cheerio from 'cheerio';

const debugLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    fs.appendFileSync('agent_debug.log', `[${timestamp}] ${msg}\n`);
    console.log(msg);
};

// 1. generate_text
export class GenerateTextTool implements ITool {
    name = 'generate_text';
    description = 'LLM-based text generation, summarization, rewriting';
    requires_network = true;
    async execute(args: { prompt: string, workspace_id: string }): Promise<ToolResult> {
        try {
            const text = await LLMService.generateText(args.workspace_id, args.prompt);
            return { success: true, data: text };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 2. run_code
export class RunCodeTool implements ITool {
    name = 'run_code';
    description = 'Execute JavaScript code in a sandboxed environment';
    requires_network = false;
    async execute(args: { code: string }): Promise<ToolResult> {
        try {
            const sandbox = { console, result: null };
            vm.createContext(sandbox);
            vm.runInContext(args.code, sandbox);
            return { success: true, data: sandbox.result };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 3. file_system
export class FileSystemTool implements ITool {
    name = 'file_system';
    description = 'Read/write/list local files and directories';
    requires_network = false;
    async execute(args: { action: 'read' | 'write' | 'list', path: string, content?: string }): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(process.cwd(), 'workspace_files', args.path);
            if (!fullPath.startsWith(path.resolve(process.cwd(), 'workspace_files'))) {
                throw new Error('Access denied: Path must be within workspace_files');
            }

            const baseDir = path.resolve(process.cwd(), 'workspace_files');
            if (!fs.existsSync(baseDir)) {
                fs.mkdirSync(baseDir, { recursive: true });
            }

            if (args.action !== 'list' && !fs.existsSync(path.dirname(fullPath))) {
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
            }

            switch (args.action) {
                case 'read':
                    const data = fs.readFileSync(fullPath, 'utf8');
                    return { success: true, data };
                case 'write':
                    const anyArgs = args as any;
                    let content = anyArgs.content || anyArgs.data || anyArgs.text;
                    if (content === undefined || content === null) {
                        throw new Error('No content provided to write to file');
                    }
                    if (typeof content !== 'string') {
                        content = JSON.stringify(content, null, 2);
                    }
                    fs.writeFileSync(fullPath, content);
                    return { success: true, data: 'File written successfully' };
                case 'list':
                    if (!fs.existsSync(fullPath)) {
                        fs.mkdirSync(fullPath, { recursive: true });
                    }
                    const files = fs.readdirSync(fullPath);
                    return { success: true, data: files };
                default:
                    throw new Error(`Unknown action: ${args.action}`);
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 4. http_request
export class HttpRequestTool implements ITool {
    name = 'http_request';
    description = 'External API calls or fetching website content';
    requires_network = true;
    async execute(args: { url: string, method?: string, body?: any, headers?: any }): Promise<ToolResult> {
        try {
            const init: RequestInit = {
                method: args.method || 'GET',
                headers: args.headers || {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            };
            if (args.body) {
                init.body = JSON.stringify(args.body);
            }
            const response = await fetch(args.url, init);
            const contentType = response.headers.get('content-type') || '';
            const text = await response.text();

            if (contentType.includes('application/json')) {
                try {
                    return { success: true, data: JSON.parse(text) };
                } catch (e) {
                    return { success: true, data: text };
                }
            }

            if (contentType.includes('text/html')) {
                const $ = cheerio.load(text);
                // Remove non-content elements
                $('script, style, nav, footer, header, noscript').remove();
                const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
                return { success: true, data: cleanText.slice(0, 15000) }; // Extract up to 15k chars
            }

            return { success: true, data: text };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 5. image_generation
export class ImageGenerationTool implements ITool {
    name = 'image_generation';
    description = 'Create images from prompts using OpenAI DALL-E or Gemini';
    requires_network = true;
    async execute(args: { prompt: string, workspace_id: string }): Promise<ToolResult> {
        try {
            const workspace = db.prepare('SELECT config FROM workspaces WHERE id = ?').get(args.workspace_id) as any;
            if (!workspace || !workspace.config) throw new Error('Workspace LLM not configured');
            const config = JSON.parse(workspace.config);

            const slug = args.prompt.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
            const fileName = `${slug}_${Date.now()}.png`;
            const filePath = path.resolve(process.cwd(), 'workspace_files', fileName);

            if (config.provider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: "dall-e-3", prompt: args.prompt, n: 1, size: "1024x1024", response_format: "b64_json" })
                });
                if (!response.ok) throw new Error(`OpenAI Error: ${(await response.json()).error?.message}`);
                const data = await response.json();
                fs.writeFileSync(filePath, Buffer.from(data.data[0].b64_json, 'base64'));
                return { success: true, data: `Image saved to ${fileName}` };
            } 

            if (config.provider === 'gemini') {
                const modelId = 'gemini-3-pro-image-preview';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${config.apiKey}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Generate an image based on this prompt: ${args.prompt}. Output ONLY the image data.` }] }]
                    })
                });
                
                const responseText = await response.text();
                if (!response.ok) throw new Error(`Gemini API Error: ${response.statusText}`);

                const data = JSON.parse(responseText);
                const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData && p.inlineData.mimeType.startsWith('image/'));
                
                if (imagePart) {
                    fs.writeFileSync(filePath, Buffer.from(imagePart.inlineData.data, 'base64'));
                    return { success: true, data: `Image saved to ${fileName}` };
                }
                throw new Error('Gemini did not return an image part.');
            }

            throw new Error(`Image generation not supported for provider: ${config.provider}`);
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 6. search_web
export class SearchWebTool implements ITool {
    name = 'search_web';
    description = 'Query search engines to find information';
    requires_network = true;
    async execute(args: { query: string }): Promise<ToolResult> {
        try {
            const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(args.query)}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            });
            const text = await response.text();
            const $ = cheerio.load(text);
            const results: any[] = [];
            $('.result__body').each((i, el) => {
                if (i < 5) {
                    results.push({
                        title: $(el).find('.result__title').text().trim(),
                        snippet: $(el).find('.result__snippet').text().trim(),
                        link: $(el).find('.result__a').attr('href')
                    });
                }
            });
            return { success: true, data: results };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 7. image_analysis
export class ImageAnalysisTool implements ITool {
    name = 'image_analysis';
    description = 'Analyze an image using vision LLM';
    requires_network = true;
    async execute(args: { prompt: string, image_path: string, workspace_id: string }): Promise<ToolResult> {
        try {
            const fullPath = path.resolve(process.cwd(), 'workspace_files', args.image_path);
            if (!fs.existsSync(fullPath)) throw new Error(`Image not found: ${args.image_path}`);
            const base64 = fs.readFileSync(fullPath).toString('base64');
            const analysis = await LLMService.analyzeImage(args.workspace_id, args.prompt, base64);
            return { success: true, data: analysis };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 8. parse_data
export class ParseDataTool implements ITool {
    name = 'parse_data';
    description = 'Extract structured JSON data from unstructured text';
    requires_network = true;
    async execute(args: { text: string, schema_description: string, workspace_id: string }): Promise<ToolResult> {
        try {
            const prompt = `Extract structured data from the following text based on this description: ${args.schema_description}\n\nText: "${args.text}"\n\nOutput ONLY valid JSON.`;
            const result = await LLMService.generateText(args.workspace_id, prompt);
            const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            return { success: true, data: JSON.parse(jsonMatch ? jsonMatch[0] : result) };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 9. transform_data
export class TransformDataTool implements ITool {
    name = 'transform_data';
    description = 'Convert or reshape data from one format to another';
    requires_network = true;
    async execute(args: { data: any, instructions: string, workspace_id: string }): Promise<ToolResult> {
        try {
            const prompt = `Transform the following data according to these instructions: ${args.instructions}\n\nData: ${JSON.stringify(args.data, null, 2)}\n\nOutput the result in the most appropriate format (JSON, CSV, etc.).`;
            const result = await LLMService.generateText(args.workspace_id, prompt);
            return { success: true, data: result };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 10. database_query
export class DatabaseQueryTool implements ITool {
    name = 'database_query';
    description = 'Query the local system database';
    requires_network = false;
    async execute(args: { query: string, params?: any[] }): Promise<ToolResult> {
        try {
            const results = db.prepare(args.query).all(args.params || []);
            return { success: true, data: results };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}

// 11. schedule_task
export class ScheduleTaskTool implements ITool {
    name = 'schedule_task';
    description = 'Wait for a specified amount of time (milliseconds)';
    requires_network = false;
    async execute(args: { delay_ms: number }): Promise<ToolResult> {
        await new Promise(resolve => setTimeout(resolve, args.delay_ms));
        return { success: true, data: `Waited for ${args.delay_ms}ms` };
    }
}

// 12. send_notification
export class SendNotificationTool implements ITool {
    name = 'send_notification';
    description = 'Send a notification via webhook';
    requires_network = true;
    async execute(args: { url: string, message: string }): Promise<ToolResult> {
        try {
            const response = await fetch(args.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: args.message, content: args.message })
            });
            return { success: true, data: `Notification sent: ${response.statusText}` };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }
}
