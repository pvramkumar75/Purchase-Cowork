export type AIProvider = 'deepseek' | 'groq' | 'gemini';

interface AIProviderConfig {
    apiUrl: string;
    apiKey: string;
    model: string;
    name: string;
    format: 'openai' | 'gemini';
}

function getProviderConfig(provider: AIProvider): AIProviderConfig {
    switch (provider) {
        case 'groq':
            return {
                apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
                apiKey: process.env.GROQ_API_KEY || '',
                model: 'llama-3.3-70b-versatile',
                name: 'Groq (Llama 3.3 70B)',
                format: 'openai'
            };
        case 'gemini':
            return {
                apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                apiKey: process.env.GEMINI_API_KEY || '',
                model: 'gemini-2.0-flash',
                name: 'Gemini 2.0 Flash',
                format: 'gemini'
            };
        case 'deepseek':
        default:
            return {
                apiUrl: 'https://api.deepseek.com/v1/chat/completions',
                apiKey: process.env.DEEPSEEK_API_KEY || '',
                model: 'deepseek-chat',
                name: 'DeepSeek',
                format: 'openai'
            };
    }
}

// Call OpenAI-compatible APIs (DeepSeek, Groq)
async function callOpenAIFormat(
    config: AIProviderConfig,
    messages: { role: string; content: string }[],
    temperature: number
): Promise<string> {
    const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages,
            temperature
        })
    });

    if (!response.ok) {
        let errorMessage = `${config.name} API error (${response.status})`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

// Call Google Gemini API (different request/response format)
async function callGeminiFormat(
    config: AIProviderConfig,
    messages: { role: string; content: string }[],
    temperature: number
): Promise<string> {
    // Separate system message from conversation
    const systemMsg = messages.find(m => m.role === 'system');
    const conversationMsgs = messages.filter(m => m.role !== 'system');

    // Convert OpenAI-style messages to Gemini format
    const geminiContents = conversationMsgs.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
        contents: geminiContents,
        generationConfig: {
            temperature,
            maxOutputTokens: 8192
        }
    };

    // Add system instruction if present
    if (systemMsg) {
        requestBody.systemInstruction = {
            parts: [{ text: systemMsg.content }]
        };
    }

    const url = `${config.apiUrl}?key=${config.apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        let errorMessage = `${config.name} API error (${response.status})`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || errorMessage;
        } catch (e) { }
        throw new Error(errorMessage);
    }

    const result = await response.json();

    // Gemini response format: result.candidates[0].content.parts[0].text
    if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Gemini returned an empty or unexpected response.');
    }

    return result.candidates[0].content.parts[0].text;
}

// Main entry point — routes to the correct format handler
export async function callAI(
    provider: AIProvider,
    messages: { role: string; content: string }[],
    temperature: number = 0.15
): Promise<string> {
    const config = getProviderConfig(provider);

    if (!config.apiKey) {
        throw new Error(`${config.name} API key is not configured. Please add it to your .env.local file.`);
    }

    if (config.format === 'gemini') {
        return callGeminiFormat(config, messages, temperature);
    } else {
        return callOpenAIFormat(config, messages, temperature);
    }
}

// List of available providers for the UI
export const AI_PROVIDERS = [
    { id: 'deepseek' as AIProvider, label: 'DeepSeek', description: 'DeepSeek Chat — Fast & accurate' },
    { id: 'groq' as AIProvider, label: 'Groq', description: 'Groq (Llama 3.3 70B) — Ultra-fast inference' },
    { id: 'gemini' as AIProvider, label: 'Gemini', description: 'Google Gemini 2.0 Flash — Powerful & versatile' }
];
