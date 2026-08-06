import { INDICES } from './_symbols.js';

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

// Parse `?symbols=AAPL,MSFT` into fetch targets. Symbols double as their own label
// (the ticker). Capped and de-duped to keep the fan-out bounded. Falls back to the
// fixed INDICES set when no `symbols` param is present.
function resolveTargets(symbolsParam) {
  if (!symbolsParam) return INDICES;
  const symbols = [
    ...new Set(
      String(symbolsParam)
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    ),
  ].slice(0, 25);
  return symbols.map((symbol) => ({ symbol, label: symbol }));
}

export default async function handler(req, res) {
  const targets = resolveTargets(req.query?.symbols);
  const results = await Promise.allSettled(targets.map(fetchQuote));
  // Preserve the requested order; drop any symbol that failed.
  const quotes = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ quotes, fetchedAt: new Date().toISOString() });
}
