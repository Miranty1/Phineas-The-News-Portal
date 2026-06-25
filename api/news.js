import Parser from 'rss-parser';
import { SOURCES } from './_sources.js';
import { jinaFetch } from './_jina.js';

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
    readable: source.readable,
    sourceAU: source.au === true,
    pubDate: item.isoDate || item.pubDate || null,
  }));
}

// Section/navigation link text on the listing page that must not be treated as articles.
const NON_ARTICLE_TITLES = /^(live markets news|markets news|personal finance|news)$/i;

// Investopedia has no usable feed, so read its markets-news listing through Jina and
// scrape genuine article links. Real articles have an 8-digit id suffix; category and
// nav links use 7-digit ids, so the {8} match filters them out.
async function fetchListSource(source) {
  const md = await jinaFetch(source.url, { timeoutMs: 14000 });
  const re = /\[([^\]]{15,130})\]\((https:\/\/www\.investopedia\.com\/[a-z0-9-]+-\d{8})\)/g;
  const seen = new Set();
  const stories = [];
  let m;
  while ((m = re.exec(md)) !== null) {
    const title = m[1].trim();
    const link = m[2];
    if (seen.has(link) || NON_ARTICLE_TITLES.test(title)) continue;
    seen.add(link);
    stories.push({
      title,
      link,
      snippet: '',
      source: source.name,
      sourceColor: source.color,
      readable: source.readable,
      sourceAU: source.au === true,
      pubDate: null,
    });
    if (stories.length >= 5) break;
  }
  if (!stories.length) throw new Error('no investopedia articles found');
  return stories;
}

export default async function handler(req, res) {
  const results = await Promise.allSettled(
    SOURCES.map((s) => (s.type === 'jina-list' ? fetchListSource(s) : fetchSource(s)))
  );

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
