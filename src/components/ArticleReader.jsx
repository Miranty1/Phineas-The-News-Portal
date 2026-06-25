import { useEffect, useState } from 'react';
import SourceTag from './SourceTag.jsx';
import Summary from './Summary.jsx';
import { relativeTime } from '../lib/time.js';

// Full-screen reader overlay. Fetches the cleaned article text from /api/article
// and renders it in the dark theme. Falls back to the RSS snippet + a link to the
// original when the source can't be extracted.
export default function ArticleReader({ story, onClose }) {
  const [state, setState] = useState('loading'); // loading | ready | failed
  const [article, setArticle] = useState(null);

  // Fetch the article content for the current story.
  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setArticle(null);

    fetch(`/api/article?url=${encodeURIComponent(story.link)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.ok) {
          setArticle(data);
          setState('ready');
        } else {
          setState('failed');
        }
      })
      .catch(() => !cancelled && setState('failed'));

    return () => {
      cancelled = true;
    };
  }, [story.link]);

  // Esc to close + lock body scroll while the reader is open.
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <article
        className="animate-riseIn relative my-0 h-fit min-h-full w-full max-w-3xl border-x border-border bg-bg px-5 py-6 shadow-2xl sm:px-10 sm:py-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky control row */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SourceTag name={story.source} color={story.sourceColor} />
            <span className="font-mono text-[11px] text-secondary">
              {relativeTime(story.pubDate)}
            </span>
            <a
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[11px] text-accent hover:underline"
            >
              Open original ↗
            </a>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reader"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border text-secondary transition hover:border-accent/50 hover:text-accent"
          >
            ✕
          </button>
        </div>

        <h1 className="mb-5 font-mono text-2xl font-bold leading-tight text-primary sm:text-3xl">
          {state === 'ready' && article.title ? article.title : story.title}
        </h1>

        {/* On-demand AI summary, same component as the cards. */}
        <Summary title={story.title} snippet={story.snippet} />

        <div className="mt-6 border-t border-border pt-6">
          {state === 'loading' && (
            <div className="space-y-3">
              <p className="mb-4 font-mono text-xs text-secondary">
                Fetching the full article… this can take a few seconds.
              </p>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-4" style={{ width: `${90 - (i % 4) * 12}%` }} />
              ))}
            </div>
          )}

          {state === 'ready' && (
            <div
              className="prose prose-invert max-w-none prose-headings:font-mono prose-a:text-accent prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}

          {state === 'failed' && (
            <div>
              <p className="mb-4 rounded-lg border border-border bg-surface/60 p-3 text-sm text-secondary">
                This article couldn’t be loaded for in-app reading. Here’s the summary from
                the feed — open the original for the full story.
              </p>
              {story.snippet && (
                <p className="text-[15px] leading-relaxed text-primary/90">{story.snippet}</p>
              )}
              <a
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition hover:bg-accent/20"
              >
                Open original ↗
              </a>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
