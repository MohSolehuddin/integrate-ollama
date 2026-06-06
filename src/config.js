// Centralized configuration
require('dotenv').config();

module.exports = {
  // Ollama Configuration
  OLLAMA_URL: process.env.OLLAMA_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'qwen2.5-coder:0.5b',
  OLLAMA_PREPROCESS_MODEL: process.env.OLLAMA_PREPROCESS_MODEL || 'gemma3:270m',

  // Budget Service Configuration
  BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://localhost:3001',
  BUDGET_DEFAULT_PASSWORD: process.env.BUDGET_DEFAULT_PASSWORD || 'secret',

  // Server Configuration
  PORT: process.env.PORT || 3002,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite'
};
