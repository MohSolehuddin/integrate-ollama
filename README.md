# integrate-ollama - API Gateway

**Branch:** `ai-dev` (active development)  
**Port:** 3002  
**AI Model:** Qwen Cloud (`qwen3-coder-next:cloud`)

## Overview

This is the **API Gateway** service that acts as the main entry point for Telegram transaction parsing. It handles:

1. Receiving Telegram transaction messages
2. Preprocessing with **Qwen Cloud** (cleaning slang → formal Indonesian)
3. Parsing transaction data with **Qwen Cloud** (extracting JSON)
4. Forwarding to integrate-actual-budget-service for budget operations

### Why Cloud AI?
- ✅ **Faster response** (no local inference delay)
- ✅ **Scalable** (no GPU bottleneck)
- ✅ **Always updated** (no manual model pulls)

## Architecture

```
Telegram → integrate-ollama:3002 → integrate-actual-budget-service:3001 → Actual Budget:5006
         (Qwen Cloud AI parsing)
```

## Quick Start

```bash
cd ~/server-app/integrate-ollama
git checkout ai-dev
npm install
cp .env.example .env
# Edit .env: add your Qwen API key and base URL
npm start
```

## Endpoints

### Health Check
```
GET /
```

### Parse Transaction
```
POST /api/transaction
```

**Request:**
```json
{
  "senderId": "7133351898",
  "chatId": "7133351898",
  "rawText": "makan 25rb"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "parsed": { "date": null, "payee": null, "category": "food", "amount": 25000, "notes": null },
    "synced": { "transactionId": "tx_..." }
  }
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_BASE_URL` | `https://api.binanceai.com/v1` | Qwen Cloud API endpoint (OpenAI-compatible) |
| `OPENAI_API_KEY` | *(required)* | Your Qwen Cloud API key |
| `OPENAI_MODEL` | `qwen3-coder-next:cloud` | AI model name |
| `BUDGET_SERVICE_URL` | `http://localhost:3001` | Budget service URL |
| `BUDGET_DEFAULT_PASSWORD` | `secret` | Default password |
| `PORT` | `3002` | Server port |
| `DATABASE_PATH` | `./database.sqlite` | SQLite database path |

## Environment Setup

1. Get your Qwen Cloud API key from [Binance AI](https://api.binanceai.com) or your Qwen provider
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env`:
   ```env
   OPENAI_BASE_URL=https://api.binanceai.com/v1
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
   OPENAI_MODEL=qwen3-coder-next:cloud
   ```

## Documentation

- **MICROSERVICES.md**: Full microservices architecture
- **API.md**: Complete API reference
- **DEVELOPMENT.md**: Development guide

## Next Steps

- [ ] Complete budget service integration
- [ ] Telegram webhook integration
- [ ] Transaction history UI
- [ ] Budget reporting API

---

*Last updated: 2026-06-06 (Qwen Cloud migration)*
