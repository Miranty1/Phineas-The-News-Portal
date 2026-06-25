// Free finance feeds (verified 2026-06). `readable: true` means the article body
// can be extracted for the in-app reader; `readable: false` sources are free to read
// but JS/consent-walled for extraction, so their cards open the original site.
// Paywalled publishers (FT, WSJ, Bloomberg, MarketWatch) are excluded entirely —
// they can't be read in-app OR on the site without a subscription.
export const SOURCES = [
  { name: 'Independent',   url: 'https://www.independent.co.uk/news/business/rss',  color: '#f97316', readable: true },
  { name: 'Guardian',      url: 'https://www.theguardian.com/uk/business/rss',      color: '#22c55e', readable: true },
  { name: 'CNBC',          url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', color: '#ef4444', readable: true },
  { name: 'BBC Business',  url: 'https://feeds.bbci.co.uk/news/business/rss.xml',    color: '#fbbf24', readable: true },
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex',          color: '#ec4899', readable: false },
  // Investopedia has no usable RSS and blocks direct fetches, so its headlines come
  // from its markets-news listing via the Jina reader (type: 'jina-list').
  { name: 'Investopedia',  url: 'https://www.investopedia.com/markets-news-4427704', color: '#06b6d4', readable: true, type: 'jina-list' },
  // Australian sources (au: true) so the Australia/International filters have real content.
  { name: 'ABC News',      url: 'https://www.abc.net.au/news/feed/51892/rss.xml',    color: '#14b8a6', readable: true, au: true },
  { name: 'Guardian AU',   url: 'https://www.theguardian.com/au/business/rss',       color: '#84cc16', readable: true, au: true },
];

// Hostnames whose articles the reader is allowed to fetch (SSRF allowlist) — only
// the `readable` sources above.
export const ALLOWED_ARTICLE_HOSTS = [
  'independent.co.uk',
  'theguardian.com',
  'cnbc.com',
  'bbc.co.uk',
  'bbc.com',
  'investopedia.com',
  'abc.net.au',
];
