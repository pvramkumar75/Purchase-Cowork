# DealPilot Industrial 🚀

**The Strategic Negotiation Co-Pilot for Professional Procurement.**

DealPilot is an industrial-grade assistant designed for purchase heads and sourcing managers. It eliminates guesswork in supplier negotiations by calculating leverage, predicting supplier intent, and generating data-driven negotiation strategies.

## ✨ Industrial Features

*   **Strategic Positioning:** Automatically classifies items into the Kraljic Matrix (Strategic, Bottleneck, Leverage, Non-critical).
*   **Financial Analytics:** Real-time calculation of price delta, percentage change, and annual cost impact.
*   **AI-Powered Playbook:** Generates clinical, professional scripts and tactical moves based on 25+ years of sourcing expertise.
*   **Dual Interface:** 
    *   **Dashboard:** A high-performance web UI with live metrics and history tracking.
    *   **Telegram Bot:** An interactive, mobile-ready assistant for negotiations on the go.
*   **Industrial Reports:** Export professional strategy documents in PDF format for internal approval.

## 🛠 Tech Stack

*   **Frontend:** Next.js 15, React, TypeScript
*   **AI:** DeepSeek-V3 API (Industrial Procurement Tuned)
*   **State:** Vercel KV (for serverless), LocalStorage (for web history)
*   **Bot:** node-telegram-bot-api (Interactive Inline mode)

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file with your credentials:
```env
DEEPSEEK_API_KEY=your_key
TELEGRAM_BOT_TOKEN=your_token
```

### 2. Run the Web Dashboard
```bash
npm install
npm run dev
```

### 3. Run the Telegram Bot (Local/Industrial Mode)
To keep the bot alive for real-time negotiations:
```bash
node telegram-bot.js
```

## 📊 Industrial Negotiation Framework
DealPilot follows the **SP-TACTIC** framework:
1. **S**ourcing Strategy Selection
2. **P**ower Balance Diagnosis
3. **T**arget Price Calculation (ZOPA)
4. **A**lternative Planning (BATNA)
5. **C**ommunication Scripting
6. **T**rade-off Mapping
7. **I**mpact Assessment
8. **C**oncession Boundary Definition

---
*Confidentiality: All negotiation data is processed securely and intended for internal procurement decision-making only.*
