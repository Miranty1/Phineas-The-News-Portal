// The finance RSS feeds Phineas aggregates, with per-source tag colours.
// NOTE: some publishers restrict their public RSS; /api/news skips any feed
// that fails to fetch or parse, so a dead feed never breaks the app.
// Verified working 2026-06. The original Reuters / Investopedia / WSJ feeds from
// the handoff have since 404'd or moved, so they've been swapped for live
// equivalents (Yahoo Finance, Guardian Business, and the Dow Jones-hosted WSJ feed).
export const SOURCES = [
  { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex',                        color: '#f97316' },
  { name: 'Guardian',      url: 'https://www.theguardian.com/uk/business/rss',                    color: '#22c55e' },
  { name: 'MarketWatch',   url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',     color: '#3b82f6' },
  { name: 'FT',            url: 'https://www.ft.com/rss/home',                                     color: '#f59e0b' },
  { name: 'CNBC',          url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',           color: '#ef4444' },
  { name: 'Bloomberg',     url: 'https://feeds.bloomberg.com/markets/news.rss',                   color: '#8b5cf6' },
  { name: 'WSJ',           url: 'https://feeds.content.dowjones.io/public/rss/RSSMarketsMain',    color: '#ec4899' },
];
