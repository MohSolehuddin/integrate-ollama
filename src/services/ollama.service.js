const axios = require('axios');
const config = require('../config');
const fs = require('fs');
const logPath = '/tmp/ollama-service-debug.log';

// Add debug write function
const writeDebug = (msg) => {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
};

// Add axios request logging
axios.interceptors.request.use(config => {
  writeDebug(`axios.request -> ${config.method?.toUpperCase()} ${config.url}`);
  if (config.headers && config.headers['Authorization']) {
    writeDebug(`auth header: ${config.headers['Authorization'].substring(0, 15)}...`);
  }
  return config;
});

// Add axios response logging
axios.interceptors.response.use(
  response => {
    writeDebug(`axios.response -> ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    writeDebug(`axios.error -> ${error.response?.status || 'UNKNOWN'} ${error.config?.url}`);
    writeDebug(`error.message: ${error.message}`);
    if (error.response?.data) {
      writeDebug(`error.data: ${error.response.data.toString().substring(0, 200)}`);
    }
    return Promise.reject(error);
  }
);

/**
 * Preprocess teks mentah menggunakan Ollama Cloud API (native /api/chat)
 * untuk merapikan dan memperjelas bahasanya.
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
    console.log("DEBUG: Calling Ollama with key=", config.OLLAMA_CLOUD_KEY.substring(0, 10) + "...");
    const response = await axios.post(`${config.OLLAMA_CLOUD_URL}/chat`, {
      model: config.OLLAMA_CLOUD_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: rawText }
      ],
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${config.OLLAMA_CLOUD_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    return response.data.message.content.trim();
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Timeout: preprocess terlalu lama (>10s)`);
    }
    throw new Error(`Gagal mem-preprocess data dengan Ollama Cloud: ${error.message}`);
  }
};

/**
 * Berkomunikasi dengan Ollama Cloud API untuk mengekstrak data transaksi ke JSON.
 * @param {string} rawText Teks transaksi mentah
 * @returns {Promise<Object>} Data transaksi yang sudah di-parse menjadi Object JavaScript
 */
const extractTransactionData = async (rawText) => {
  try {
    console.log("DEBUG extractTransactionData: Calling preprocessText for:", rawText);
    const cleanText = await preprocessText(rawText);
    console.log("Cleaned by Ollama Cloud:", cleanText);

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

    const response = await axios.post(`${config.OLLAMA_CLOUD_URL}/chat`, {
      model: config.OLLAMA_CLOUD_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: cleanText }
      ],
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${config.OLLAMA_CLOUD_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const content = response.data.message.content.trim();
    // Extract JSON block (handles markdown ```json or plain)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Gagal parse JSON dari Ollama Cloud output: ${content}`);
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error(`Timeout: parsing transaksi terlalu lama (>10s)`);
    }
    throw new Error(`Gagal memproses data dengan Ollama Cloud: ${error.message}`);
  }
};

module.exports = {
  extractTransactionData,
  preprocessText
};
