require('dotenv').config();
const app = require('./app');

const PORT = require('./config').PORT;
const OLLAMA_URL = require('./config').OLLAMA_URL;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Terhubung ke Ollama di: ${OLLAMA_URL}`);
    console.log(`Terhubung ke Budget Service di: ${require('./config').BUDGET_SERVICE_URL}`);
  });
};

startServer();
