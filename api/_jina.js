// Thin wrapper around the Jina AI Reader proxy (https://r.jina.ai/<url>), which
// renders a page server-side and returns clean markdown. Used to read sources that
// block our direct fetch (e.g. Investopedia). A JINA_API_KEY is optional — it only
// raises the rate limits; the service works key-free.
export async function jinaFetch(targetUrl, { timeoutMs = 12000 } = {}) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; PhineasBot/1.0)',
    // Ask Jina to also append a links summary (handy for listing pages).
    'X-With-Links-Summary': 'true',
  };
  if (process.env.JINA_API_KEY) {
    headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://r.jina.ai/${targetUrl}`, {
      headers,
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Jina ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}
