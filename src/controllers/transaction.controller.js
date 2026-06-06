const ollamaService = require('../services/ollama.service');
const budgetService = require('../services/budget.service');
const { db, getUserBySenderId, getOrCreateUser } = require('../database');

const parseTransaction = async (req, res) => {
  try {
    let inputData = req.body.rawText;

    // If rawText is not present, assume req.body.message or entire body is input
    if (!inputData && req.body.message) {
      inputData = req.body.message;
    }
    if (!inputData && Object.keys(req.body).length > 0) {
      inputData = JSON.stringify(req.body);
    }

    if (!inputData || inputData.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "Data transaksi tidak boleh kosong" 
      });
    }

    // Get or create user for this sender
    const senderId = req.body.senderId || req.headers['x-telegram-sender'] || 'default';
    
    // Filter: only accept sender 7133351898
    const allowedSenders = ['7133351898'];
    if (!allowedSenders.includes(senderId)) {
      return res.status(403).json({
        success: false,
        error: "Sender tidak diizinkan"
      });
    }
    
    console.log(`Processing transaction for sender: ${senderId} (allowed)`);

    // Parse transaction via Ollama
    const parsedData = await ollamaService.extractTransactionData(inputData);
    console.log(`Parsed data:`, parsedData);

    // Get or create user in database
    let user = await getUserBySenderId(senderId);
    if (!user) {
      console.log(`Creating new user for sender_id: ${senderId}`);
      user = await getOrCreateUser(senderId, `user_${senderId}@localhost`, `User ${senderId}`);
    }

    // Sync to Budget Service
    const syncResult = await budgetService.processTransaction(senderId, {
      ...parsedData,
      chatId: req.body.chatId,
      rawText: inputData
    });

    return res.status(200).json({
      success: true,
      data: {
        parsed: parsedData,
        synced: syncResult
      }
    });

  } catch (error) {
    console.error("Transaction Controller Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Terjadi kesalahan internal" 
    });
  }
};

// Test endpoint untuk health check
const testEndpoint = (req, res) => {
  res.json({
    status: 'ok',
    service: 'Test',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  parseTransaction,
  testEndpoint
};
