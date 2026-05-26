const express = require('express');
const app = express();
const port = 3001;

// Middleware WAJIB agar Express bisa membaca JSON dari frontend
app.use(express.json());

// Endpoint POST untuk transaksi
app.post('/api/transaction', async (req, res) => {
  try {
    // 1. Tangkap teks mentah dari body request (Gaya Express)
    const { rawText } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "Teks transaksi tidak boleh kosong" });
    }

    // 2. Siapkan Prompt Super Ketat untuk Qwen 0.5B
    const systemPrompt = `Kamu adalah mesin pemroses data API otomatis.
Tugasmu HANYA mengekstrak teks mentah menjadi objek JSON yang valid.

ATURAN MUTLAK:
1. JANGAN ucapkan salam, basa-basi, atau kata pengantar.
2. JANGAN gunakan markdown block (seperti \`\`\`json).
3. Output HANYA BOLEH berupa format JSON murni.
4. Jika data tidak lengkap, gunakan nilai null.

SKEMA JSON:
{
  "date": "YYYY-MM-DD",
  "payee": "Nama toko/penerima",
  "category": "Kategori pengeluaran",
  "amount": angka numerik,
  "notes": "Catatan tambahan"
}

CONTOH INPUT: "Beli makan siang di warteg mas budi tadi siang 25000"
CONTOH OUTPUT: {"date": "2026-05-24", "payee": "Warteg Mas Budi", "category": "Food", "amount": 25000, "notes": "Makan siang"}

INPUT PENGGUNA:
"${rawText}"`;

    // 3. Tentukan URL Ollama
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

    // 4. Panggil API Ollama
    // (Note: Node.js versi 18 ke atas sudah support fetch bawaan)
    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:0.5b',
        prompt: systemPrompt,
        format: 'json', // Kunci mutlak agar tidak melenceng
        stream: false,
        temperature: 0.0 // Mematikan "kreativitas" AI
      })
    });

    if (!ollamaResponse.ok) {
      throw new Error("Gagal terhubung ke Ollama");
    }

    const data = await ollamaResponse.json();
    
    // 5. Parse string JSON dari AI menjadi Object JavaScript sungguhan
    const parsedData = JSON.parse(data.response);

    // 6. Kembalikan balasan sukses ke frontend (Gaya Express)
    return res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Terjadi kesalahan internal" 
    });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server Actual Budget AI berjalan di http://localhost:${port}`);
});