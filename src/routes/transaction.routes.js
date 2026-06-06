const express = require('express');
const router = express.Router();

// POST /api/transaction - Parse and sync transaction
router.post('/transaction', async (req, res) => {
  res.json({ success: true, message: 'Transaction endpoint' });
});

// GET /test - Test endpoint
router.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'Test endpoint', timestamp: new Date().toISOString() });
});

// GET /test/ollama - Test Ollama connection
router.get('/test/ollama', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const data = await response.json();
    res.json({ status: 'ok', ollama: data });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// GET /budget/status - Get budget status for sender
router.get('/budget/status', (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

// GET /budget/accounts - Get budget accounts
router.get('/budget/accounts', (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

// GET /budget/categories - Get budget categories
router.get('/budget/categories', (req, res) => {
  res.status(501).json({ success: false, error: 'Not implemented yet' });
});

module.exports = router;
