const axios = require('axios');

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Missing token parameter");
  }

  const target = `https://apinums.com/apinumsofficial/smsapi/getsms.php?token=${token}`;

  try {
    const response = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://apinums.com/",
        "Origin": "https://apinums.com",
      },
      timeout: 10000,
    });

    const raw = response.data;
    const rawStr = typeof raw === 'string' ? raw : JSON.stringify(raw);

    // === CODE EXTRACT KARNE KI KOSHISH ===
    let code = null;

    // 1. Try parsing as pure JSON
    try {
      const parsed = typeof raw === 'object' ? raw : JSON.parse(raw);
      if (parsed && parsed.code !== undefined) {
        code = parsed.code;
      }
    } catch (e) {
      // Ignore and try regex
    }

    // 2. Regex se "code" extract karo (mixed text + JSON ke liye)
    if (code === null) {
      const match = rawStr.match(/"code"\s*:\s*"([^"]+)"/);
      if (match) code = match[1];
    }

    // === CLEAN RESPONSE BHEJO ===
    if (code !== null) {
      return res.status(200).json({
        site: "Moon US Nums",
        code: code,
      });
    }

    // Fallback: agar code nahi mila to original bhej do
    res.status(200).send(raw);

  } catch (error) {
    const errorMsg = error.response
      ? `Upstream Error: ${error.response.status}`
      : `Fetch Error: ${error.message}`;
    res.status(500).send(errorMsg);
  }
}
