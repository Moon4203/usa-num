const axios = require('axios');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  const { token } = req.query;
  if (!token) return res.status(400).send("Missing token parameter");

  const target = `https://apinums.com/apinumsofficial/smsapi/getsms.php?token=${token}`;

  try {
    const response = await axios.get(target, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://apinums.com/",
        "Origin": "https://apinums.com",
      },
      timeout: 10000,
      transformResponse: [(data) => data],
      maxRedirects: 5,
      validateStatus: () => true,
    });

    let rawStr = response.data;
    if (typeof rawStr !== 'string') rawStr = JSON.stringify(rawStr);

    // === CODE EXTRACT KARNE KI KOSHISH (MULTIPLE PATTERNS) ===
    let code = null;
    const patterns = [
      /"code"\s*:\s*"([^"]+)"/,
      /'code'\s*:\s*'([^']+)'/,
      /data-code="([^"]+)"/,
      /<span[^>]*class="[^"]*code[^"]*"[^>]*>([^<]+)<\/span>/i,
      /id="code"[^>]*>([^<]+)</i,
    ];
    for (const pat of patterns) {
      const match = rawStr.match(pat);
      if (match && match[1] !== 'waiting') {
        code = match[1];
        break;
      }
    }

    if (code) {
      return res.status(200).json({ site: "Moon US Nums", code: code, v: "3.0" });
    }

    // === FALLBACK: Pura HTML bhejo taake pata chale kya hai ===
    return res.status(200).json({
      site: "Moon US Nums",
      status: "waiting",
      debug: "HTML page received. Code is loaded via JavaScript AJAX.",
      html_length: rawStr.length,
      v: "3.0"
    });

  } catch (error) {
    return res.status(500).json({ site: "Moon US Nums", error: error.message, v: "3.0" });
  }
}
