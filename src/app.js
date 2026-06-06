const express = require('express');
const app = express();
const transactionRoutes = require('./routes/transaction.routes');
const config = require('./config');
const http = require('http');

// Middleware
app.use(express.json());

// Register Routes
app.use('/api', transactionRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Test endpoint', timestamp: new Date().toISOString() });
});

// Health check (Production-ready)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Integrate Ollama - API Gateway',
    port: config.PORT,
    timestamp: new Date().toISOString()
  });
});

// Test Ollama
app.get('/test/ollama', (req, res) => {
  try {
    const options = {
      hostname: 'host.docker.internal',
      port: 11434,
      path: '/api/tags',
      method: 'GET',
      timeout: 10000,
      headers: { 'Accept': 'application/json' }
    };
    
    const callback = (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          res.json({ status: 'ok', ollama: parsed });
        } catch (e) {
          res.status(500).json({ status: 'error', error: 'Failed to parse response' });
        }
      });
    };
    
    const req = http.request(options, callback);
    req.on('error', (error) => {
      console.error('Ollama fetch error:', error.message);
      res.status(500).json({ status: 'error', error: error.message });
    });
    req.on('timeout', () => {
      req.destroy();
      res.status(500).json({ status: 'error', error: 'Request timeout' });
    });
    req.end();
  } catch (error) {
    console.error('Ollama fetch error:', error.message);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

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

module.exports = app;
