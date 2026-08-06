import { YAHOO_UA } from './_yahoo.js';

// OHLCV history for the interactive chart, from Yahoo's keyless v8 chart endpoint.
// Each UI range maps to the Yahoo range + interval that gives a sensible point count.
const CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';

const RANGES = {
  '1D': { range: '1d', interval: '5m' },
  '5D': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '3M': { range: '3mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
};

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || '').trim().toUpperCase();
  const rangeKey = String(req.query?.range || '1M').toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });

  const { range, interval } = RANGES[rangeKey] || RANGES['1M'];

  try {
    const url = `${CHART}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
    const r = await fetch(url, { headers: { 'User-Agent': YAHOO_UA } });
    if (!r.ok) throw new Error(`chart ${r.status}`);
    const data = await r.json();

    const result = data?.chart?.result?.[0];
    const ts = result?.timestamp || [];
    const q = result?.indicators?.quote?.[0] || {};

    // lightweight-charts wants ascending, gap-free points with a numeric time.
    const candles = [];
    for (let i = 0; i < ts.length; i++) {
      const open = q.open?.[i];
      const high = q.high?.[i];
      const low = q.low?.[i];
      const close = q.close?.[i];
      if (open == null || high == null || low == null || close == null) continue;
      candles.push({
        time: ts[i],
        open,
        high,
        low,
        close,
        volume: q.volume?.[i] ?? 0,
      });
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ symbol, range: rangeKey, candles });
  } catch (err) {
    console.error('[api/candles]', symbol, rangeKey, err);
    res.status(502).json({ error: err.message || 'candles fetch failed' });
  }
}
