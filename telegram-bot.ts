import TelegramBot from 'node-telegram-bot-api';
import { getNegotiationGuidance } from './src/lib/negotiator.js'; // Use .js for local execution if node doesn't support ts-node directly
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const allowedId = process.env.ALLOWED_TELEGRAM_ID;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not found in .env.local');
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log('DealPilot Telegram Bot is running...');

const userStates: { [key: number]: any } = {};

const formSteps = [
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

    if (allowedId && chatId.toString() !== allowedId.toString()) {
        bot.sendMessage(chatId, "Unauthorized user.");
        return;
    }

    bot.sendMessage(chatId, "👋 Welcome to DealPilot Negotiation Co-Pilot.\n\nType /negotiate to start a fresh guidance session.");
});

bot.onText(/\/negotiate/, (msg) => {
    const chatId = msg.chat.id;

    if (allowedId && chatId.toString() !== allowedId.toString()) {
        bot.sendMessage(chatId, "Unauthorized user.");
        return;
    }

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
            const guidance = await getNegotiationGuidance(state.data);

            // Split guidance into sections for better readability on Telegram
            const sections = guidance.split(/\n(?=[A-Z\s]+:)/);

            for (const section of sections) {
                if (section.trim()) {
                    await bot.sendMessage(chatId, section.trim());
                }
            }

            bot.sendMessage(chatId, "✅ Negotiation strategy complete. Type /negotiate to start again.");
            delete userStates[chatId];
        } catch (error: any) {
            bot.sendMessage(chatId, `❌ Error calling AI: ${error.message}`);
            delete userStates[chatId];
        }
    }
});

bot.on('polling_error', (error: any) => {
    console.log('Polling error:', error.code);
});
