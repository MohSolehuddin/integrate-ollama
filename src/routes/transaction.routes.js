const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// Endpoint: POST /api/transaction
router.post('/', transactionController.parseTransaction);

module.exports = router;
