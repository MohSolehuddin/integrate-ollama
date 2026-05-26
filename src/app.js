const express = require('express');
const transactionRoutes = require('./routes/transaction.routes');

const app = express();

// Middleware WAJIB agar Express bisa membaca JSON dari frontend
app.use(express.json());

// Registrasi Routes
app.use('/api/transaction', transactionRoutes);

// Penanganan Route Not Found (404)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

module.exports = app;
