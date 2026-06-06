const axios = require('axios');
const config = require('../config');

/**
 * Preprocess teks mentah menggunakan Qwen Cloud untuk merapikan dan memperjelas bahasanya.
 * @param {string} rawText Teks transaksi mentah dari pengguna
 * @returns {Promise<string>} Kalimat yang lebih jelas
 */
const preprocessText = async (rawText) => {
  const systemPrompt = `Tugasmu adalah memperbaiki bahasa gaul/singkatan menjadi kalimat deskriptif baku.
ATURAN:
- JANGAN mengarang informasi yang tidak ada.
- JANGAN tambahkan tanggal, nama orang, atau tempat jika tidak disebutkan.
- Hanya output satu kalimat baku.

CONTOH:
Input: "makan 25rb"
Output: "Pengeluaran untuk makan sebesar 25000."

Input: "gopud 32"
Output: "Pengeluaran untuk gofood sebesar 32000."

Input: "utang ke agus 300"
Output: "Membayar utang kepada Agus sebesar 300000."

Input: "${rawText}"
Output: `.trim();

  try {
    if (!config.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY belum di-set. Pastikan sudah ada di .env');
    }

    const response = await axios.post(`${config.OPENAI_BASE_URL}/chat/completions`, {
      model: config.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Transaksi: ' + rawText }
      ],
      temperature: 0.1,
      max_tokens: 100
    }, {
      headers: {
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10s timeout
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Timeout: preprocess terlalu lama (>10s)`);
    }
    throw new Error(`Gagal mem-preprocess data dengan Qwen Cloud: ${error.message}`);
  }
};

/**
 * Berkomunikasi dengan Qwen Cloud API untuk mengekstrak data transaksi ke JSON.
 * @param {string} rawText Teks transaksi mentah
 * @returns {Promise<Object>} Data transaksi yang sudah di-parse menjadi Object JavaScript
 */
const extractTransactionData = async (rawText) => {
  try {
    console.log("Original Input:", rawText);
    const cleanText = await preprocessText(rawText);
    console.log("Cleaned by Qwen:", cleanText);

    const systemPrompt = `Extract transaction data into JSON.
RULES:
- DO NOT make up data.
- If payee/notes are missing, output null.
- amount must be number.

EXAMPLES:
Text: "Pengeluaran untuk makan sebesar 25000."
JSON: {"date": null, "payee": null, "category": "food", "amount": 25000, "notes": null}

Text: "Membayar utang kepada Agus sebesar 300000."
JSON: {"date": null, "payee": "Agus", "category": "debt", "amount": 300000, "notes": null}

Text: "${cleanText}"
JSON: `.trim();

    const response = await axios.post(`${config.OPENAI_BASE_URL}/chat/completions`, {
      model: config.OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Parse: ' + cleanText }
      ],
      temperature: 0.0,
      max_tokens: 256
    }, {
      headers: {
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const content = response.data.choices[0].message.content.trim();
    // Extract JSON block (handles markdown ```json or plain)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Gagal parse JSON dari Qwen output: ${content}`);
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Timeout: parsing transaksi terlalu lama (>10s)`);
    }
    throw new Error(`Gagal memproses data dengan Qwen Cloud: ${error.message}`);
  }
};

module.exports = {
  extractTransactionData,
  preprocessText
};
