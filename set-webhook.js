const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const token = process.env.TELEGRAM_BOT_TOKEN;
const rawUrl = process.argv[2];

if (!token || !rawUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing parameters.');
    console.log('Usage: node set-webhook.js <YOUR_PRODUCTION_URL>');
    console.log('Example: node set-webhook.js https://my-app.vercel.app');
    process.exit(1);
}

// Clean the URL and ensure it points to the correct endpoint
const baseUrl = rawUrl.replace(/\/$/, "");
const webhookUrl = `${baseUrl}/api/webhook/telegram`;

async function setWebhook() {
    console.log(`Setting webhook for: ${webhookUrl}...`);

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
        const result = await response.json();

        if (result.ok) {
            console.log('\x1b[32m%s\x1b[0m', 'SUCCESS: Webhook has been set!');
            console.log(result.description);
        } else {
            console.log('\x1b[31m%s\x1b[0m', 'FAILED: Telegram rejected the webhook.');
            console.log(result);
        }
    } catch (err) {
        console.error('Network Error:', err.message);
    }
}

setWebhook();
