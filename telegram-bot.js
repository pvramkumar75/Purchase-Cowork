const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const fetch = require('node-fetch');
const { FORM_STEPS, SYSTEM_PROMPT } = require('./bot-config');

dotenv.config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in .env.local');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const userStates = {};

console.log('🚀 DealPilot Industrial Bot is running...');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id,
        "🏢 *DealPilot Industrial Procurement Co-Pilot* (v1.1.0)\n\n" +
        "Welcome colleague. I am your strategic assistant for supplier negotiations.\n\n" +
        "Use /negotiate to start a data-driven strategy session.",
        { parse_mode: 'Markdown' }
    );
});

bot.onText(/\/negotiate/, (msg) => {
    const chatId = msg.chat.id;
    userStates[chatId] = { step: 0, data: {} };
    askStep(chatId);
});

async function askStep(chatId) {
    const state = userStates[chatId];
    if (!state) return;

    const step = FORM_STEPS[state.step];
    if (!step) {
        finishNegotiation(chatId);
        return;
    }

    if (step.options) {
        const keyboard = step.options.map(opt => [{ text: opt, callback_data: opt }]);
        bot.sendMessage(chatId, `*Step ${state.step + 1}:* ${step.label}`, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: keyboard }
        });
    } else {
        bot.sendMessage(chatId, `*Step ${state.step + 1}:* ${step.label}`, { parse_mode: 'Markdown' });
    }
}

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const state = userStates[chatId];

    if (!state) return;

    const step = FORM_STEPS[state.step];
    state.data[step.key] = query.data;
    state.step++;

    bot.answerCallbackQuery(query.id);
    askStep(chatId);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const state = userStates[chatId];

    if (!state || !text || text.startsWith('/')) return;

    const step = FORM_STEPS[state.step];
    if (step.options) return; // Wait for callback query

    state.data[step.key] = text;
    state.step++;
    askStep(chatId);
});

async function finishNegotiation(chatId) {
    const state = userStates[chatId];
    bot.sendMessage(chatId, "📊 *Data Collection Complete.*\nCalculating Industrial Strategy...", { parse_mode: 'Markdown' });

    try {
        const data = state.data;
        const lastPrice = parseFloat(data.lastPrice) || 0;
        const currentQuote = parseFloat(data.currentQuote) || 0;
        const targetPrice = parseFloat(data.targetPrice) || 0;
        const annualQty = parseFloat(data.annualQuantity?.replace(/,/g, '')) || 0;

        const priceIncrease = lastPrice > 0 ? ((currentQuote - lastPrice) / lastPrice) * 100 : 0;
        const annualImpact = (currentQuote - lastPrice) * annualQty;

        const userPrompt = `INDUSTRIAL NEGOTIATION DATA:
- Item: ${data.itemName}
- Supplier: ${data.supplierName}
- Current Impact: ${priceIncrease.toFixed(2)}% increase | Annual Impact: ${annualImpact.toFixed(2)}
- Stock: ${data.stock} | Risk: ${data.stoppageRisk}
- Competition: ${data.otherSuppliers} | Load: ${data.vendorLoad}
- Behavior: ${data.attitude} | Reason: ${data.increaseReason}
- Constraint: ${data.fixedOnVendor}

Full Data: ${JSON.stringify(data)}`;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${deepseekApiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.15
            })
        });

        const result = await response.json();
        const guidance = result.choices[0].message.content;

        // Split long messages for Telegram
        const chunks = guidance.match(/[\s\S]{1,4000}(?:\n|$)/g) || [guidance];
        for (const chunk of chunks) {
            await bot.sendMessage(chatId, chunk, { parse_mode: 'Markdown' });
        }

        bot.sendMessage(chatId, "✅ *Session Complete.*\nType /negotiate for a new strategy.");
        delete userStates[chatId];

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, "❌ *Error:* Failed to calculate strategy. Please try again later.");
        delete userStates[chatId];
    }
}
