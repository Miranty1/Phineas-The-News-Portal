// Market indices shown fixed on the left of the top ticker, in display order.
// `^`-prefixed symbols are indices; BTC-USD is crypto; AUDUSD=X is an FX pair.
// Yahoo's chart endpoint resolves all of these without an API key.
export const INDICES = [
  { symbol: '^GSPC',    label: 'S&P 500' },
  { symbol: '^IXIC',    label: 'NASDAQ' },
  { symbol: '^DJI',     label: 'DOW' },
  { symbol: '^AXJO',    label: 'ASX 200' },
  { symbol: 'BTC-USD',  label: 'BTC' },
  { symbol: 'AUDUSD=X', label: 'AUD/USD' },
];

// Back-compat alias: existing callers importing SYMBOLS get the index set.
export const SYMBOLS = INDICES;
