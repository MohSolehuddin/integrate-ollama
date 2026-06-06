// Centralized configuration
require('dotenv').config();

module.exports = {
  // Ollama Cloud Configuration
  OLLAMA_CLOUD_URL: process.env.OLLAMA_CLOUD_URL || 'https://api.ollama.com',
  OLLAMA_CLOUD_KEY: process.env.OLLAMA_CLOUD_KEY || null,
  OLLAMA_CLOUD_MODEL: process.env.OLLAMA_CLOUD_MODEL || 'qwen3-coder-next:cloud',

  // Budget Service Configuration
  BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://localhost:3001',
  BUDGET_DEFAULT_PASSWORD: process.env.BUDGET_DEFAULT_PASSWORD || 'secret',

  // Server Configuration
  PORT: process.env.PORT || 3002,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite'
};
