const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in .env.local');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('DealPilot Telegram Bot is running (CommonJS mode)...');

const systemPrompt = `You are a senior procurement negotiation strategist with 25+ years industrial sourcing experience.
Your purpose is NOT to teach negotiation theory.
Your purpose is to calculate the economically rational next move in a live supplier negotiation.
Thin in terms of leverage, dependency, alternatives, time pressure, switching cost, supplier psychology, bluff probability, and concession sequencing.
Never give motivational advice.
Respond like an experienced purchase head coaching another purchase head privately.
Output format exactly:
NEGOTIATION MODE:
POSITION:
SUPPLIER INTENT:
NEXT MOVE:
SAY THIS:
AVOID THIS:
CONCESSION LIMIT:
ESCALATION PLAN:
Be concise and practical.`;

const userStates = {};

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

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "👋 Welcome to DealPilot Negotiation Co-Pilot.\n\nType /negotiate to start a fresh guidance session.");
});

bot.onText(/\/negotiate/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 0, data: {} };
    bot.sendMessage(chatId, `Step 1: ${formSteps[0].label}`);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text || text.startsWith('/')) return;
    if (!userStates[chatId]) return;

    const state = userStates[chatId];
    const currentStep = formSteps[state.step];

    state.data[currentStep.key] = text;
    state.step++;

    if (state.step < formSteps.length) {
        bot.sendMessage(chatId, `Step ${state.step + 1}: ${formSteps[state.step].label}`);
    } else {
        bot.sendMessage(chatId, "🔄 Analyzing data and calculating strategy...");

        try {
            const userPrompt = `NEGOTIATION DATA:\n` + Object.keys(state.data).map(k => `${k}: ${state.data[k]}`).join('\n');

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.2
                })
            });

            const aiResult = await response.json();
            const guidance = aiResult.choices[0].message.content;

            const itemName = state.data.itemName || 'Item';
            const supplierName = state.data.supplierName || 'N/A';

            await bot.sendMessage(chatId, `📋 *NEGOTIATION REPORT: ${itemName}*\n🏢 *Supplier:* ${supplierName}\n\nAnalyzing data and calculating strategy...`, { parse_mode: 'Markdown' });

            const sections = guidance.split(/\n(?=[A-Z\s]+:)/);
            for (const section of sections) {
                if (section.trim()) {
                    await bot.sendMessage(chatId, section.trim());
                }
            }

            bot.sendMessage(chatId, "✅ Negotiation strategy complete. Type /negotiate to start again.");
            delete userStates[chatId];
        } catch (error) {
            bot.sendMessage(chatId, `❌ Error calling AI: ${error.message}`);
            delete userStates[chatId];
        }
    }
});

bot.on('polling_error', (error) => {
    console.log('Polling error:', error.code);
});
