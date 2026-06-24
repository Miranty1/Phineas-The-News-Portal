import Parser from 'rss-parser';
import { SOURCES } from './_sources.js';

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PhineasBot/1.0)' },
});

// Strip HTML tags and collapse whitespace from an RSS snippet/description.
function cleanSnippet(text = '') {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 280);
}

async function fetchSource(source) {
  const feed = await parser.parseURL(source.url);
  return (feed.items || []).slice(0, 5).map((item) => ({
    title: item.title?.trim() || 'Untitled',
    link: item.link || '#',
    snippet: cleanSnippet(item.contentSnippet || item.content || item.summary || ''),
    source: source.name,
    sourceColor: source.color,
    pubDate: item.isoDate || item.pubDate || null,
  }));
}

export default async function handler(req, res) {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));

  const stories = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value);

  // Sort newest first; items without a date sink to the bottom.
  stories.sort((a, b) => {
    const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
    const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
    return tb - ta;
  });

  const failed = SOURCES
    .filter((_, i) => results[i].status === 'rejected')
    .map((s) => s.name);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ stories, failed, fetchedAt: new Date().toISOString() });
}
