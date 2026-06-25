import { extract } from '@extractus/article-extractor';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { ALLOWED_ARTICLE_HOSTS } from './_sources.js';
import { jinaFetch } from './_jina.js';

// Jina returns markdown; the leading metadata lines (Title/URL Source/...) and any
// image-only lines aren't article body, so trim them before rendering.
function jinaMarkdownToHtml(md) {
  const marker = 'Markdown Content:';
  const idx = md.indexOf(marker);
  const body = idx >= 0 ? md.slice(idx + marker.length) : md;
  const html = marked.parse(body, { mangle: false, headerIds: false });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: { a: ['href', 'target', 'rel'], img: ['src', 'alt'] },
  });
}

// Returns true if the URL's host is (or is a subdomain of) an allowed source host.
function isAllowed(host) {
  return ALLOWED_ARTICLE_HOSTS.some(
    (h) => host === h || host.endsWith(`.${h}`)
  );
}

export default async function handler(req, res) {
  const target = req.query?.url;
  if (!target) return res.status(400).json({ ok: false, error: 'url is required' });

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid url' });
  }

  // SSRF guard: only fetch articles from our known, readable source domains.
  if (parsed.protocol !== 'https:' || !isAllowed(parsed.hostname)) {
    return res.status(400).json({ ok: false, error: 'host not allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const textLen = (html) => html.replace(/<[^>]*>/g, '').trim().length;

  // Primary: fast readability extraction (works for most RSS sources).
  try {
    const article = await extract(
      target,
      {},
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
        },
      }
    );
    const content = article?.content || '';
    if (content && textLen(content) >= 200) {
      return res.status(200).json({
        ok: true,
        title: article.title || '',
        content,
        author: article.author || '',
        published: article.published || '',
        url: target,
      });
    }
  } catch (err) {
    console.error('[api/article] extract failed:', err?.message);
  }

  // Fallback: render the page through Jina (handles bot-walled sources like Investopedia).
  try {
    const md = await jinaFetch(target, { timeoutMs: 45000 });
    const titleMatch = md.match(/^Title:\s*(.+)$/m);
    const content = jinaMarkdownToHtml(md);
    if (textLen(content) >= 200) {
      return res.status(200).json({
        ok: true,
        title: titleMatch ? titleMatch[1].trim() : '',
        content,
        author: '',
        published: '',
        url: target,
      });
    }
  } catch (err) {
    console.error('[api/article] jina fallback failed:', err?.message);
  }

  return res.status(200).json({ ok: false, error: 'no readable content' });
}
