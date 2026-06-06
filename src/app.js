const express = require('express');
const app = express();
const config = require('./config');

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Integrate Ollama - API Gateway',
    port: config.PORT
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Terjadi kesalahan internal'
  });
});

// Only start server if this file is run directly
if (require.main === module) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Terhubung ke Ollama di: ${config.OLLAMA_URL}`);
    console.log(`Terhubung ke Budget Service di: ${config.BUDGET_SERVICE_URL}`);
  });
}

module.exports = app;
