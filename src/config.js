// Centralized configuration
require('dotenv').config();

module.exports = {
  // Qwen Cloud Configuration (OpenAI-compatible)
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.binanceai.com/v1',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'qwen3-coder-next:cloud',

  // Budget Service Configuration
  BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://localhost:3001',
  BUDGET_DEFAULT_PASSWORD: process.env.BUDGET_DEFAULT_PASSWORD || 'secret',

  // Server Configuration
  PORT: process.env.PORT || 3002,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite'
};
