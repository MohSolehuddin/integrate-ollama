# integrate-ollama - API Gateway

**Branch:** `ai-dev` (active development)  
**Port:** 3002

## Overview

This is the **API Gateway** service that acts as the main entry point for Telegram transaction parsing. It handles:

1. Receiving Telegram transaction messages
2. Preprocessing with Ollama (Gemma model)
3. Parsing transaction data with Ollama (Qwen model)
4. Forwarding to integrate-actual-budget-service for budget operations

## Architecture

```
Telegram → integrate-ollama:3002 → integrate-actual-budget-service:3001 → Actual Budget:5006
```

## Quick Start

```bash
cd ~/server-app/integrate-ollama
npm install
cp .env.example .env
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
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen2.5-coder:0.5b` | Parsing model |
| `OLLAMA_PREPROCESS_MODEL` | `gemma3:270m` | Preprocessing model |
| `BUDGET_SERVICE_URL` | `http://localhost:3001` | Budget service URL |
| `BUDGET_DEFAULT_PASSWORD` | `***` | Default password |
| `PORT` | `3002` | Server port |
| `DATABASE_PATH` | `./database.sqlite` | SQLite database path |

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

*Last updated: 2026-06-06*
