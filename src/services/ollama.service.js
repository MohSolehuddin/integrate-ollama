const config = require('../config');

/**
 * Preprocess teks mentah menggunakan model Gemma untuk merapikan dan memperjelas bahasanya.
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
    const response = await fetch(`${config.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.OLLAMA_PREPROCESS_MODEL,
        prompt: systemPrompt,
        stream: false,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error (Preprocess): ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response.trim();
  } catch (error) {
    throw new Error(`Gagal mem-preprocess data dengan Gemma: ${error.message}`);
  }
};

/**
 * Berkomunikasi dengan Ollama API untuk mengekstrak data transaksi
 * @param {string} rawText Teks transaksi mentah
 * @returns {Promise<Object>} Data transaksi yang sudah di-parse menjadi Object JavaScript
 */
const extractTransactionData = async (rawText) => {
  try {
    console.log("Original Input:", rawText);
    const cleanText = await preprocessText(rawText);
    console.log("Cleaned by Gemma:", cleanText);

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

    const response = await fetch(`${config.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.OLLAMA_MODEL,
        prompt: systemPrompt,
        format: 'json', 
        stream: false,
        temperature: 0.0 
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    throw new Error(`Gagal memproses data dengan Ollama: ${error.message}`);
  }
};

module.exports = {
  extractTransactionData,
  preprocessText
};
