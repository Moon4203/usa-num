const axios = require('axios');

export default async function handler(req, res) {
  // ⬇️ Cache rokne ke liye headers (ye zaroori hain)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

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
      // ⬇️ Axios ko transform mat karne dein - raw text hi chahiye
      transformResponse: [(data) => data],
    });

    let rawStr = response.data;

    // Agar object aa gaya to string bana dein
    if (typeof rawStr !== 'string') {
      rawStr = JSON.stringify(rawStr);
    }

    // === CODE EXTRACT KARO ===
    let code = null;

    // Method 1: JSON parse try karo
    try {
      const parsed = JSON.parse(rawStr);
      if (parsed && parsed.code !== undefined) {
        code = parsed.code;
      }
    } catch (e) {
      // Ignore
    }

    // Method 2: Regex se dhoondo
    if (code === null) {
      const match = rawStr.match(/"code"\s*:\s*"([^"]+)"/);
      if (match) code = match[1];
    }

    // === CLEAN RESPONSE ===
    if (code !== null) {
      return res.status(200).json({
        site: "Moon US Nums",
        code: code,
        v: "2.0"   // ⬅️ Version marker (check karne ke liye)
      });
    }

    // Fallback: agar code nahi mila to debug info bhejo
    return res.status(200).json({
      site: "Moon US Nums",
      error: "No code found in upstream response",
      raw_preview: rawStr.substring(0, 200),
      v: "2.0"
    });

  } catch (error) {
    const errorMsg = error.response
      ? `Upstream Error: ${error.response.status}`
      : `Fetch Error: ${error.message}`;
    return res.status(500).json({
      site: "Moon US Nums",
      error: errorMsg,
      v: "2.0"
    });
  }
}
