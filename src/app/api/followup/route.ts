import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/config';

export async function POST(req: Request) {
    try {
        const { messages, negotiationContext } = await req.json();
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

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

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: apiMessages,
                temperature: 0.2
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to call AI');
        }

        const aiResult = await response.json();
        const reply = aiResult.choices[0].message.content;

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error('Follow-up API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
