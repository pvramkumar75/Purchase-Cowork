---
description: How to integrate and deploy a Telegram Bot on Vercel (Serverless)
---

### Step 1: Create the Entry Point (API Route)
On Vercel, the bot must be a serverless function rather than a persistent script.
- Create a file at `src/app/api/webhook/telegram/route.ts`.
- Export a `POST` handler that listens for updates from Telegram.
- **Principle:** The code must be "Stateless". It processes one message and exits.

### Step 2: Persistent State (Memory)
Since functions are stateless, the bot will "forget" user progress after each message.
- **The Fix:** Use a persistent database like **Vercel KV (Redis)**.
- **The Flow:**
  1. Message arrives -> Extract `chatId`.
  2. Fetch existing state from Redis using `state:${chatId}`.
  3. Process message (e.g., update form step).
  4. Save new state back to Redis with an expiration (e.g., 1 hour).
  5. Respond to Telegram.

### Step 3: Setup the Webhook
Tell Telegram to push messages to your URL instead of holding them.
1. Deploy your code to Vercel and get the public URL (e.g., `https://my-app.vercel.app`).
2. Register the webhook by visiting:
   `https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=<YOUR_VERCEL_URL>/api/webhook/telegram`
3. Verify the response: `{"ok":true,"result":true,"description":"Webhook was set"}`.

### Step 4: Environment Variables
Add these to your project settings (Vercel/Local):
- `TELEGRAM_BOT_TOKEN`: From @BotFather.
- `DEEPSEEK_API_KEY`: For AI logic.
- `KV_URL` / `KV_REST_API_URL`: Provided automatically when connecting Vercel KV.
