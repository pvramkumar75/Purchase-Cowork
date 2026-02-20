import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getNegotiationGuidance } from '@/lib/negotiator';
import { FORM_STEPS } from '@/lib/config';

async function sendTelegramMessage(chatId: number, text: string, options: any = {}) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is missing');

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            ...options
        })
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Telegram API Error:', err);
    }
    return response;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (!body || !body.message || !body.message.chat) {
            return NextResponse.json({ ok: true });
        }

        const chatId = body.message.chat.id;
        const text = body.message.text;

        if (text === '/start') {
            await sendTelegramMessage(chatId, "🏢 *DealPilot Industrial Procurement Bot*\n\nType /negotiate to start.");
            return NextResponse.json({ ok: true });
        }

        if (text === '/negotiate') {
            const initialState = { step: 0, data: {} };
            await kv.set(`state:${chatId}`, initialState, { ex: 3600 });
            await askStep(chatId, 0);
            return NextResponse.json({ ok: true });
        }

        const state: any = await kv.get(`state:${chatId}`);

        if (state && typeof state.step === 'number') {
            const currentStep = FORM_STEPS[state.step];
            state.data[currentStep.key] = text;
            state.step++;

            if (state.step < FORM_STEPS.length) {
                await kv.set(`state:${chatId}`, state, { ex: 3600 });
                await askStep(chatId, state.step);
            } else {
                await sendTelegramMessage(chatId, "📊 *Analyzing data and calculating strategy...*");
                try {
                    const guidance = await getNegotiationGuidance(state.data);

                    const chunks = guidance.match(/[\s\S]{1,4000}(?:\n|$)/g) || [guidance];
                    for (const chunk of chunks) {
                        await sendTelegramMessage(chatId, chunk);
                    }

                    await sendTelegramMessage(chatId, "✅ *Strategy complete.* Type /negotiate to start again.");
                    await kv.del(`state:${chatId}`);
                } catch (error: any) {
                    await sendTelegramMessage(chatId, `❌ Error: ${error.message}`);
                    await kv.del(`state:${chatId}`);
                }
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ ok: true });
    }
}

async function askStep(chatId: number, stepIndex: number) {
    const step = FORM_STEPS[stepIndex];
    let msg = `*Step ${stepIndex + 1}:* ${step.label}`;
    if (step.options) {
        msg += `\n\nOptions: ${step.options.join(', ')}`;
    }
    await sendTelegramMessage(chatId, msg);
}
