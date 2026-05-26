const ollamaService = require('../services/ollama.service');

const parseTransaction = async (req, res) => {
  try {
    let inputData = req.body.rawText;

    // Jika rawText tidak ada, asumsikan seluruh req.body adalah input JSON yang dimaksud
    if (!inputData && Object.keys(req.body).length > 0) {
      inputData = req.body;
    }

    // Ubah ke string jika input berupa JSON object
    if (typeof inputData === 'object') {
      // inputData = JSON.stringify(inputData);
      inputData = inputData.message;
    }

    if (!inputData || inputData.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: "Data transaksi tidak boleh kosong" 
      });
    }

    // Panggil Service untuk logika bisnis
    const parsedData = await ollamaService.extractTransactionData(inputData);

    return res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Transaction Controller Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Terjadi kesalahan internal" 
    });
  }
};

module.exports = {
  parseTransaction
};
