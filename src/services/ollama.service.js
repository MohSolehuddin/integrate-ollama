const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:0.5b';
const OLLAMA_PREPROCESS_MODEL = process.env.OLLAMA_PREPROCESS_MODEL || 'gemma3:270m';
const { getTransactionPrompt, getPreprocessPrompt } = require('../utils/prompts');

/**
 * Preprocess teks mentah menggunakan model Gemma untuk merapikan dan memperjelas bahasanya.
 * @param {string} rawText Teks transaksi mentah dari pengguna
 * @returns {Promise<string>} Kalimat yang lebih jelas
 */
const preprocessText = async (rawText) => {
  const systemPrompt = getPreprocessPrompt(rawText);

  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_PREPROCESS_MODEL,
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

    const systemPrompt = getTransactionPrompt(cleanText);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
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
  extractTransactionData
};
