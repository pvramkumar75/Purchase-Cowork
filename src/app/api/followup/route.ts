import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/config';
import { callAI, AIProvider } from '@/lib/ai-provider';

export async function POST(req: Request) {
    try {
        const { messages, negotiationContext, aiProvider } = await req.json();
        const provider: AIProvider = aiProvider || 'deepseek';

        // Build the system message with negotiation context
        const contextPrompt = `${SYSTEM_PROMPT}

IMPORTANT: You are in a FOLLOW-UP conversation. The buyer has already received their initial strategy report and now has follow-up questions.

CONTEXT FROM THE ORIGINAL NEGOTIATION:
- Item: ${negotiationContext.itemName || 'N/A'}
- Supplier: ${negotiationContext.supplierName || 'N/A'}
- Category: ${negotiationContext.purchaseCategory || 'N/A'}
- Last Price: ${negotiationContext.lastPrice || 'N/A'}
- Current Quote: ${negotiationContext.currentQuote || 'N/A'}
- Target Price: ${negotiationContext.targetPrice || 'N/A'}

RULES FOR FOLLOW-UP:
1. Answer in simple, clear English
2. Be specific with numbers and actions
3. Keep answers focused and concise (not too long)
4. If they ask about email wording, provide ready-to-use text
5. If they ask "what if" scenarios, give specific tactical advice`;

        const apiMessages = [
            { role: 'system', content: contextPrompt },
            ...messages
        ];

        const reply = await callAI(provider, apiMessages, 0.2);
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Follow-up API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
