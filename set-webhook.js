const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookUrl = process.argv[2];

if (!token || !webhookUrl) {
    console.error('Usage: node set-webhook.js <YOUR_PUBLIC_WEBHOOK_URL>');
    console.error('Example: node set-webhook.js https://your-domain.com/api/webhook/telegram');
    process.exit(1);
}

async function setWebhook() {
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const result = await response.json();
    console.log('Telegram Response:', result);
}

setWebhook();
