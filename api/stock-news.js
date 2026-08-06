import Parser from 'rss-parser';

// Ticker-specific news from Google News RSS search, shaped to match the StoryCard
// story contract used across the app (see api/news.js). These are external links,
// so readable:false — StockNews opens them in a new tab rather than the in-app reader.
const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PhineasBot/1.0)' },
});

function cleanSnippet(text = '') {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 240);
}

// Google News titles are "Headline - Publisher"; keep the headline, surface the
// publisher separately when present.
function splitTitle(title = '') {
  const idx = title.lastIndexOf(' - ');
  if (idx > 20) {
    return { headline: title.slice(0, idx).trim(), publisher: title.slice(idx + 3).trim() };
  }
  return { headline: title.trim(), publisher: null };
}

export default async function handler(req, res) {
  const symbol = String(req.query?.symbol || '').trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'symbol is required' });

  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      symbol + ' stock'
    )}&hl=en-US&gl=US&ceid=US:en`;
    const feed = await parser.parseURL(url);

    const stories = (feed.items || []).slice(0, 9).map((item) => {
      const { headline, publisher } = splitTitle(item.title);
      return {
        title: headline || item.title || 'Untitled',
        link: item.link || '#',
        snippet: cleanSnippet(item.contentSnippet || item.content || ''),
        source: publisher || 'Google News',
        sourceColor: '#60a5fa',
        readable: false,
        sourceAU: false,
        pubDate: item.isoDate || item.pubDate || null,
      };
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ symbol, stories });
  } catch (err) {
    console.error('[api/stock-news]', symbol, err);
    res.status(200).json({ symbol, stories: [] });
  }
}
