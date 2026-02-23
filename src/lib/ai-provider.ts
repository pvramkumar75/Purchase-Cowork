export type AIProvider = 'deepseek' | 'groq';

interface AIProviderConfig {
    apiUrl: string;
    apiKey: string;
    model: string;
    name: string;
}

function getProviderConfig(provider: AIProvider): AIProviderConfig {
    switch (provider) {
        case 'groq':
            return {
                apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
                apiKey: process.env.GROQ_API_KEY || '',
                model: 'llama-3.3-70b-versatile',
                name: 'Groq (Llama 3.3 70B)'
            };
        case 'deepseek':
        default:
            return {
                apiUrl: 'https://api.deepseek.com/v1/chat/completions',
                apiKey: process.env.DEEPSEEK_API_KEY || '',
                model: 'deepseek-chat',
                name: 'DeepSeek'
            };
    }
}

export async function callAI(
    provider: AIProvider,
    messages: { role: string; content: string }[],
    temperature: number = 0.15
): Promise<string> {
    const config = getProviderConfig(provider);

    if (!config.apiKey) {
        throw new Error(`${config.name} API key is not configured. Please add it to your .env.local file.`);
    }

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
        } catch (e) {
            // ignore parse error
        }
        throw new Error(errorMessage);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

// List of available providers for the UI
export const AI_PROVIDERS = [
    { id: 'deepseek' as AIProvider, label: 'DeepSeek', description: 'DeepSeek Chat — Fast & accurate' },
    { id: 'groq' as AIProvider, label: 'Groq', description: 'Groq (Llama 3.3 70B) — Ultra-fast inference' }
];
