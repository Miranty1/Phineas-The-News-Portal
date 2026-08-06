import { yahooJson } from './_yahoo.js';

// Sector peers via Yahoo's authenticated screener. First resolve the ticker's sector
// from assetProfile, then screen for the largest same-sector US equities. Returns up
// to 6, excluding the ticker itself. Empty array when the sector is unknown or the
// screener is unavailable — the Related Assets row just doesn't render.
const QUOTE_SUMMARY = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';
const SCREENER = 'https://query2.finance.yahoo.com/v1/finance/screener';

const raw = (v) => (v && typeof v === 'object' && 'raw' in v ? v.raw : v ?? null);

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || '').trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });

  try {
    const profile = await yahooJson(
      `${QUOTE_SUMMARY}/${encodeURIComponent(symbol)}?modules=assetProfile`
    );
    const sector = profile?.quoteSummary?.result?.[0]?.assetProfile?.sector;

    let peers = [];
    if (sector) {
      const screen = await yahooJson(SCREENER, {
        method: 'POST',
        body: {
          size: 8,
          offset: 0,
          sortField: 'intradaymarketcap',
          sortType: 'DESC',
          quoteType: 'EQUITY',
          query: {
            operator: 'AND',
            operands: [
              { operator: 'EQ', operands: ['sector', sector] },
              { operator: 'EQ', operands: ['region', 'us'] },
            ],
          },
          userId: '',
          userIdType: 'guid',
        },
      });

      const quotes = screen?.finance?.result?.[0]?.quotes || [];
      peers = quotes
        .filter((qt) => qt.symbol && qt.symbol.toUpperCase() !== symbol)
        .slice(0, 6)
        .map((qt) => ({
          symbol: qt.symbol,
          name: qt.shortName || qt.longName || qt.symbol,
          price: raw(qt.regularMarketPrice),
          changePercent: raw(qt.regularMarketChangePercent),
        }));
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ symbol, sector: sector || null, peers });
  } catch (err) {
    console.error('[api/peers]', symbol, err);
    // Peers are non-essential — never fail the page over them.
    res.status(200).json({ symbol, sector: null, peers: [] });
  }
}
