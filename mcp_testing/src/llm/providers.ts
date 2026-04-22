import { LLMConfig } from '../types';

export interface ILLMProvider {
    generateText(input: string, config: LLMConfig): Promise<string>;
    analyzeImage(input: string, imageBase64: string, config: LLMConfig): Promise<string>;
}

export class OllamaProvider implements ILLMProvider {
    async generateText(input: string, config: LLMConfig): Promise<string> {
        const baseUrl = config.baseUrl || 'http://localhost:11434';
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({
                model: config.model,
                prompt: input,
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
        }

        const data = await response.json() as { response: string };
        return data.response;
    }

    async analyzeImage(input: string, imageBase64: string, config: LLMConfig): Promise<string> {
        const baseUrl = config.baseUrl || 'http://localhost:11434';
        // Ollama uses 'images' array for vision models like llava
        const response = await fetch(`${baseUrl}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({
                model: config.model,
                prompt: input,
                images: [imageBase64],
                stream: false
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ollama vision error: ${response.statusText}`);
        }

        const data = await response.json() as { response: string };
        return data.response;
    }
}

export class OpenAIProvider implements ILLMProvider {
    async generateText(input: string, config: LLMConfig): Promise<string> {
        if (!config.apiKey) throw new Error('OpenAI API key is required');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: input }]
            })
        });

        if (!response.ok) {
            const err = await response.json() as any;
            throw new Error(`OpenAI error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        return data.choices[0]?.message?.content || '';
    }

    async analyzeImage(input: string, imageBase64: string, config: LLMConfig): Promise<string> {
        if (!config.apiKey) throw new Error('OpenAI API key is required');
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: input },
                            {
                                type: 'image_url',
                                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const err = await response.json() as any;
            throw new Error(`OpenAI vision error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        return data.choices[0]?.message?.content || '';
    }
}

export class GeminiProvider implements ILLMProvider {
    async generateText(input: string, config: LLMConfig): Promise<string> {
        if (!config.apiKey) throw new Error('Gemini API key is required');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: input }] }]
            })
        });

        if (!response.ok) {
            const err = await response.json() as any;
            throw new Error(`Gemini error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Gemini returned an empty or unexpected response structure');
        }
        return data.candidates[0].content.parts[0].text || '';
    }

    async analyzeImage(input: string, imageBase64: string, config: LLMConfig): Promise<string> {
        if (!config.apiKey) throw new Error('Gemini API key is required');
        
        // Use gemini-1.5-flash or pro for vision
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: input },
                        {
                            inline_data: {
                                mime_type: 'image/jpeg',
                                data: imageBase64
                            }
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const err = await response.json() as any;
            throw new Error(`Gemini vision error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
            throw new Error('Gemini vision returned an empty or unexpected response structure');
        }
        return data.candidates[0].content.parts[0].text || '';
    }
}
