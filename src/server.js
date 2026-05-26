require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Terhubung ke Ollama di: ${OLLAMA_URL}`);
  });
};

startServer();
