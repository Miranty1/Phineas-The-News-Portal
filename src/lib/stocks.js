// Client helpers for the stock detail endpoints. Thin wrappers over the /api/*
// serverless functions (which proxy keyless Yahoo Finance).

async function getJSON(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Full header/metrics/analyst/earnings for one ticker.
export function getStockDetail(symbol) {
  return getJSON(`/api/stock?symbol=${encodeURIComponent(symbol)}`);
}

// OHLCV candles for a range key (1D, 5D, 1M, 3M, 6M, 1Y, 5Y).
export function getCandles(symbol, range) {
  return getJSON(
    `/api/candles?symbol=${encodeURIComponent(symbol)}&range=${encodeURIComponent(range)}`
  );
}

// Same-sector peers for the Related Assets row.
export function getPeers(symbol) {
  return getJSON(`/api/peers?symbol=${encodeURIComponent(symbol)}`);
}

// Ticker-specific news (Google News RSS), in the shared StoryCard shape.
export function getStockNews(symbol) {
  return getJSON(`/api/stock-news?symbol=${encodeURIComponent(symbol)}`);
}
