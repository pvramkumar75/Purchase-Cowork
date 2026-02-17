import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getNegotiationGuidance } from '@/lib/negotiator';

// Lightweight Telegram message sender for Serverless (no heavy library dependencies)
async function sendTelegramMessage(chatId: number, text: string, options: any = {}) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is missing in Environment Variables');

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            ...options
        })
    });

    if (!response.ok) {
        const err = await response.json();
        console.error('Telegram API Error Response:', JSON.stringify(err));
    }
    return response;
}

const formSteps = [
    { key: 'itemName', label: 'Item / Part Name' },
    { key: 'supplierName', label: 'Supplier Name' },
    { key: 'lastPrice', label: 'Last Purchase Price (Number)' },
    { key: 'currentQuote', label: 'Vendor Current Quote (Number)' },
    { key: 'targetPrice', label: 'Target / Expected Price (Number)' },
    { key: 'annualQuantity', label: 'Annual Quantity' },
    { key: 'costKnowledge', label: 'Vendor Cost Knowledge (None / Rough / Detailed)' },
    { key: 'rmTrend', label: 'Raw Material Trend (Decrease / Stable / Increase %)' },
    { key: 'stock', label: 'Current Stock (Less than 3 days / 1 week / 2-4 weeks / Safe)' },
    { key: 'stoppageRisk', label: 'Line Stoppage Risk (Immediate / This week / This month / No risk)' },
    { key: 'alternateTime', label: 'Alternate Approval Time (Approved / 2 weeks / 2 months / Not possible)' },
    { key: 'tooling', label: 'Tool Ownership (Company / Vendor / Shared / No tooling)' },
    { key: 'otherSuppliers', label: 'Other Suppliers (None / Risky / 2-3 workable / Many)' },
    { key: 'vendorLoad', label: 'Vendor Load (Overloaded / Normal / Hungry)' },
    { key: 'paymentTerms', label: 'Payment Terms (Advance / Short / Normal / Long)' },
    { key: 'responseSpeed', label: 'Response Speed (Avoiding / Slow / Normal / Eager)' },
    { key: 'increaseReason', label: 'Reason for Increase (RM / Labour / Power / Demand / Unclear)' },
    { key: 'attitude', label: 'Attitude (Defensive / Emotional / Aggressive / Cooperative / Bluff feel)' },
    { key: 'immediateAsk', label: 'Asking immediate confirmation (Strong / Mild / No)' },
    { key: 'fixedOnVendor', label: 'Company fixed on vendor (Fixed / Prefer / Free)' },
    { key: 'whyFixed', label: 'Why fixed (Customer spec / Design / Reliability / Management / Agreement)' },
    { key: 'qtyFlexibility', label: 'Quantity flexibility (No / Partial / Yes)' },
    { key: 'specRelaxation', label: 'Spec relaxation possible (No / Maybe / Yes)' },
    { key: 'internalSupport', label: 'Internal support (Strong / Neutral / Weak)' }
];

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Basic Telegram update structure check
        if (!body || !body.message || !body.message.chat) {
            return NextResponse.json({ ok: true });
        }

        const chatId = body.message.chat.id;
        const text = body.message.text;

        // 1. Handle Basic Commands
        if (text === '/start') {
            await sendTelegramMessage(chatId, "👋 Welcome to DealPilot Negotiation Co-Pilot.\n\nType /negotiate to start a fresh guidance session.");
            return NextResponse.json({ ok: true });
        }

        if (text === '/negotiate') {
            const initialState = { step: 0, data: {} };
            // Save state in Vercel KV for persistence across serverless runs
            await kv.set(`state:${chatId}`, initialState, { ex: 3600 });
            await sendTelegramMessage(chatId, `Step 1: ${formSteps[0].label}`);
            return NextResponse.json({ ok: true });
        }

        // 2. Handle Continuous Conversational State
        const state: any = await kv.get(`state:${chatId}`);

        if (state && typeof state.step === 'number') {
            const currentStep = formSteps[state.step];
            state.data[currentStep.key] = text;
            state.step++;

            if (state.step < formSteps.length) {
                // Save intermediate progress
                await kv.set(`state:${chatId}`, state, { ex: 3600 });
                await sendTelegramMessage(chatId, `Step ${state.step + 1}: ${formSteps[state.step].label}`);
            } else {
                // Form Complete -> Run AI Analysis
                await sendTelegramMessage(chatId, "🔄 Analyzing data and calculating strategy...");

                try {
                    const guidance = await getNegotiationGuidance(state.data);

                    const itemName = state.data.itemName || 'Item';
                    const supplierName = state.data.supplierName || 'N/A';

                    await sendTelegramMessage(chatId, `📋 *NEGOTIATION REPORT: ${itemName}*\n🏢 *Supplier:* ${supplierName}`, { parse_mode: 'Markdown' });

                    // Split guidance into sections for readability and length limits
                    const sections = guidance.split(/\n(?=[A-Z\s]+:)/);
                    for (const section of sections) {
                        if (section.trim()) {
                            await sendTelegramMessage(chatId, section.trim());
                        }
                    }

                    await sendTelegramMessage(chatId, "✅ Negotiation strategy complete. Type /negotiate to start again.");
                    await kv.del(`state:${chatId}`);
                } catch (error: any) {
                    console.error('DeepSeek/Negotiator Error:', error);
                    await sendTelegramMessage(chatId, `❌ Negotiation Error: ${error.message}`);
                    await kv.del(`state:${chatId}`);
                }
            }
        } else if (text && !text.startsWith('/')) {
            await sendTelegramMessage(chatId, "No active negotiation session found. Type /negotiate to start.");
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Serious Webhook Error:', error);

        // Try to notify the user if possible, but only if we have a token
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            const body = await req.clone().json();
            const chatId = body?.message?.chat?.id;
            if (token && chatId) {
                const url = `https://api.telegram.org/bot${token}/sendMessage`;
                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `⚠️ Bot Error: ${error.message}\n\nCheck if Vercel KV is connected and Environment Variables are set.`
                    })
                });
            }
        } catch (e) {
            // Ignore secondary errors
        }

        return NextResponse.json({ ok: true });
    }
}
