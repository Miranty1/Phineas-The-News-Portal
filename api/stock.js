import { yahooJson, YAHOO_UA } from './_yahoo.js';

// Consolidated stock detail: the keyless v8 chart `meta` block (price, 52w range,
// day range, volume, company name) merged with authenticated quoteSummary modules
// (market cap, P/E, avg volume, analyst targets, earnings). Every field degrades to
// null on absence — a partial response is better than a 500.

const CHART = 'https://query1.finance.yahoo.com/v8/finance/chart';
const QUOTE_SUMMARY = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';
const MODULES =
  'summaryDetail,financialData,defaultKeyStatistics,calendarEvents,earnings,assetProfile';

// Yahoo wraps numbers as { raw, fmt }; pull the raw value (or null).
const raw = (v) => (v && typeof v === 'object' && 'raw' in v ? v.raw : v ?? null);

async function fetchMeta(symbol) {
  const res = await fetch(`${CHART}/${encodeURIComponent(symbol)}?range=1d&interval=1d`, {
    headers: { 'User-Agent': YAHOO_UA },
  });
  if (!res.ok) throw new Error(`chart ${res.status}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error('no chart meta');
  return meta;
}

async function fetchSummary(symbol) {
  try {
    const data = await yahooJson(
      `${QUOTE_SUMMARY}/${encodeURIComponent(symbol)}?modules=${MODULES}`
    );
    return data?.quoteSummary?.result?.[0] || {};
  } catch {
    // Fundamentals are best-effort; the header still renders from chart meta.
    return {};
  }
}

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || '').trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });

  try {
    const [meta, summary] = await Promise.all([fetchMeta(symbol), fetchSummary(symbol)]);

    const sd = summary.summaryDetail || {};
    const fd = summary.financialData || {};
    const ce = summary.calendarEvents || {};
    const ap = summary.assetProfile || {};
    const quarterly = summary.earnings?.earningsChart?.quarterly || [];
    const lastQuarter = quarterly[quarterly.length - 1] || {};

    const price = meta.regularMarketPrice ?? null;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? null;
    const change = price != null && prevClose != null ? price - prevClose : null;
    const changePercent =
      change != null && prevClose ? (change / prevClose) * 100 : null;

    const earningsDate = ce.earnings?.earningsDate?.[0];

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      symbol,
      name: meta.longName || meta.shortName || symbol,
      price,
      change,
      changePercent,
      prevClose,
      dayHigh: meta.regularMarketDayHigh ?? null,
      dayLow: meta.regularMarketDayLow ?? null,
      high52: meta.fiftyTwoWeekHigh ?? raw(sd.fiftyTwoWeekHigh),
      low52: meta.fiftyTwoWeekLow ?? raw(sd.fiftyTwoWeekLow),
      volume: meta.regularMarketVolume ?? raw(sd.volume),
      avgVolume: raw(sd.averageVolume),
      marketCap: raw(sd.marketCap),
      peRatio: raw(sd.trailingPE),
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || meta.fullExchangeName || null,
      sector: ap.sector || null,
      industry: ap.industry || null,
      summary: ap.longBusinessSummary || null,
      analyst: {
        mean: raw(fd.targetMeanPrice),
        high: raw(fd.targetHighPrice),
        low: raw(fd.targetLowPrice),
        rating: fd.recommendationKey || null,
        count: raw(fd.numberOfAnalystOpinions),
      },
      earnings: {
        date: raw(earningsDate),
        lastEps: raw(lastQuarter.actual),
        lastEpsEstimate: raw(lastQuarter.estimate),
      },
    });
  } catch (err) {
    console.error('[api/stock]', symbol, err);
    res.status(502).json({ error: err.message || 'stock fetch failed' });
  }
}
