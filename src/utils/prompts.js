const getPreprocessPrompt = (rawText) => {
  return `Tugasmu adalah memperbaiki bahasa gaul/singkatan menjadi kalimat deskriptif baku.
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
Output:`.trim();
};

const getTransactionPrompt = (cleanText) => {
  return `Extract transaction data into JSON.
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
JSON:`.trim();
};

module.exports = { getTransactionPrompt, getPreprocessPrompt };
