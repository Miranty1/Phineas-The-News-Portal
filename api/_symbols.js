// Symbols shown in the top price ticker, in display order.
// `^`-prefixed symbols are indices; BTC-USD is crypto. Yahoo's chart endpoint
// resolves all of these without an API key.
export const SYMBOLS = [
  { symbol: '^GSPC',   label: 'S&P 500' },
  { symbol: '^IXIC',   label: 'NASDAQ' },
  { symbol: '^DJI',    label: 'DOW' },
  { symbol: 'AAPL',    label: 'AAPL' },
  { symbol: 'MSFT',    label: 'MSFT' },
  { symbol: 'NVDA',    label: 'NVDA' },
  { symbol: 'AMZN',    label: 'AMZN' },
  { symbol: 'GOOGL',   label: 'GOOGL' },
  { symbol: 'META',    label: 'META' },
  { symbol: 'TSLA',    label: 'TSLA' },
  { symbol: 'BTC-USD', label: 'BTC' },
];
