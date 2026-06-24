import { SYMBOLS } from './_symbols.js';

// Yahoo Finance's chart endpoint returns the current price + previous close in its
// `meta` block, with no API key required. Fetched server-side to avoid CORS.
const CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchQuote({ symbol, label }) {
  const url = `${CHART}/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PhineasBot/1.0)' },
  });
  if (!res.ok) throw new Error(`${symbol} ${res.status}`);

  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  const price = meta?.regularMarketPrice;
  const prev = meta?.chartPreviousClose ?? meta?.previousClose;
  if (typeof price !== 'number' || typeof prev !== 'number' || prev === 0) {
    throw new Error(`${symbol} missing price data`);
  }

  const change = price - prev;
  return {
    symbol,
    label,
    price,
    change,
    changePercent: (change / prev) * 100,
  };
}

export default async function handler(req, res) {
  const results = await Promise.allSettled(SYMBOLS.map(fetchQuote));
  // Preserve the configured order; drop any symbol that failed.
  const quotes = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ quotes, fetchedAt: new Date().toISOString() });
}
