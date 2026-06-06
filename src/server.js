require('dotenv').config();
const app = require('./app');

const PORT = require('./config').PORT;
const OLLAMA_CLOUD_URL = require('./config').OLLAMA_CLOUD_URL;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Terhubung ke Ollama Cloud di: ${OLLAMA_CLOUD_URL}`);
    console.log(`Terhubung ke Budget Service di: ${require('./config').BUDGET_SERVICE_URL}`);
  });
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
