// Centralized configuration
require('dotenv').config();
console.log("DEBUG: OLLAMA_CLOUD_KEY loaded =", process.env.OLLAMA_CLOUD_KEY ? "loaded" : "NULL");

module.exports = {
  // Ollama Cloud Configuration
  OLLAMA_CLOUD_URL: process.env.OLLAMA_CLOUD_URL || 'https://ollama.com/api',
  OLLAMA_CLOUD_KEY: process.env.OLLAMA_CLOUD_KEY || '43f189ff4cb74195b3104a02cf1af25f.16j3wT6nc2RUtcgfgI8iW3_J',
  OLLAMA_CLOUD_MODEL: process.env.OLLAMA_CLOUD_MODEL || 'qwen3-coder-next:cloud',

  // Budget Service Configuration
  BUDGET_SERVICE_URL: process.env.BUDGET_SERVICE_URL || 'http://localhost:3001',
  BUDGET_DEFAULT_PASSWORD: process.env.BUDGET_DEFAULT_PASSWORD || 'secret',

  // Server Configuration
  PORT: process.env.PORT || 3002,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite'
};
