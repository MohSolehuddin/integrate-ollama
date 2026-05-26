const fs = require("fs");

const API_URL = "http://localhost:3001/api/transaction";

const inputs = [
  "makan 25rb",
  "kopi 18k",
  "indomaret 45",
  "alfamart 32",
  "gopud 28",
  "grab 17",
  "gojek 15",
  "isi bensin 100",
  "pertalite 50",
  "parkir 5",
  "tol 15",
  "bayar kos 750",
  "listrik 200",
  "token 100",
  "wifi 350",
  "air galon 25",
  "laundry 30",
  "steam 120",
  "spotify 55",
  "netflix 65",
  "youtube premium 40",
  "chatgpt 300",
  "shopee 145",
  "tokped 88",
  "beli keyboard 450",
  "mouse 120",
  "monitor 2500",
  "headset 350",
  "pulsa 50",
  "paket data 75",
  "bpjs 150",
  "obat 45",
  "dokter 120",
  "mie ayam 20",
  "bakso 25",
  "nasgor 22",
  "ayam geprek 18",
  "martabak 45",
  "es teh 5",
  "boba 28",
  "roti 15",
  "jajan 12",
  "rokok 38",
  "vape liquid 120",
  "kopi kenangan 30",
  "starbucks 75",
  "mixue 16",
  "kfc 57",
  "mcd 68",
  "pizza hut 120",
  "burger bangor 40",
  "sate padang 35",
  "warteg 18",
  "nasi padang 28",
  "ayam bakar 32",
  "sushi 95",
  "ramen 88",
  "donat 25",
  "ciki 10",
  "susu 22",
  "buah 35",
  "sayur 20",
  "daging 120",
  "ikan 55",
  "telur 30",
  "beras 72",
  "minyak 25",
  "sabun 18",
  "sampo 35",
  "pasta gigi 15",
  "skincare 250",
  "serum 180",
  "barber 35",
  "potong rambut 25",
  "cuci motor 15",
  "servis motor 175",
  "ganti oli 65",
  "ban motor 250",
  "tf ibu 1000",
  "tf ayah 500",
  "utang ke agus 300",
  "dibayar budi 150",
  "kasbon 200",
  "gaji 3200",
  "bonus 500",
  "thr 2500",
  "freelance 750",
  "proyek 1500",
  "donasi 50",
  "sedekah 20",
  "masjid 15",
  "zakat 300",
  "kado 120",
  "main 80",
  "bioskop 50",
  "hotel 450",
  "travel 800",
  "kereta 120",
  "pesawat 1500",
  "ojol 19",
  "grabfood 42",
  "gocar 35",
];

// jumlah request parallel
const CONCURRENCY = 50;

async function requestAI(input) {
  const startedAt = performance.now();

  try {
    console.log(`Testing: ${input}`);

    const requestBody = {
      message: input,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    let responseData = null;

    try {
      responseData = await response.json();
    } catch {
      responseData = await response.text();
    }

    const endedAt = performance.now();

    const durationMs = Number((endedAt - startedAt).toFixed(2));

    console.log(`OK ${durationMs}ms`);

    return {
      timestamp: new Date().toISOString(),

      success: response.ok,

      durationMs,

      request: requestBody,

      response: responseData,

      status: response.status,
    };
  } catch (error) {
    const endedAt = performance.now();

    const durationMs = Number((endedAt - startedAt).toFixed(2));

    console.log(`FAILED ${durationMs}ms`);

    return {
      timestamp: new Date().toISOString(),

      success: false,

      durationMs,

      request: {
        message: input,
      },

      error: error.message,
    };
  }
}

async function processBatch(batch) {
  return Promise.all(batch.map((input) => requestAI(input)));
}

async function bruteForce() {
  const logs = [];

  const totalStartedAt = performance.now();

  for (let i = 0; i < inputs.length; i += CONCURRENCY) {
    const batch = inputs.slice(i, i + CONCURRENCY);

    console.log(`\nBatch ${i / CONCURRENCY + 1}`);

    const results = await processBatch(batch);

    logs.push(...results);
  }

  const totalEndedAt = performance.now();

  const totalDurationMs = Number((totalEndedAt - totalStartedAt).toFixed(2));

  fs.writeFileSync(
    "./ai-transaction-log.json",
    JSON.stringify(logs, null, 2),
    "utf-8",
  );

  const successCount = logs.filter((x) => x.success).length;

  const failedCount = logs.filter((x) => !x.success).length;

  const avgResponseMs =
    logs.reduce((acc, item) => acc + item.durationMs, 0) / logs.length;

  console.log("\n=== DONE ===");

  console.log(`Total Request : ${logs.length}`);
  console.log(`Success       : ${successCount}`);
  console.log(`Failed        : ${failedCount}`);
  console.log(`Average AI Response : ${avgResponseMs.toFixed(2)}ms`);
  console.log(`Total Duration      : ${totalDurationMs}ms`);

  console.log("\nLog saved to ai-transaction-log.json");
}

bruteForce();
