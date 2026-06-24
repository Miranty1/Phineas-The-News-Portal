import { extract } from '@extractus/article-extractor';
import { ALLOWED_ARTICLE_HOSTS } from './_sources.js';

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

    // Treat very thin extractions as failures so the client can fall back.
    const content = article?.content || '';
    if (!content || content.replace(/<[^>]*>/g, '').trim().length < 200) {
      return res.status(200).json({ ok: false, error: 'no readable content' });
    }

    return res.status(200).json({
      ok: true,
      title: article.title || '',
      content,
      author: article.author || '',
      published: article.published || '',
      url: target,
    });
  } catch (err) {
    console.error('[api/article]', err?.message);
    return res.status(200).json({ ok: false, error: 'extraction failed' });
  }
}
