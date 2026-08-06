import { useEffect, useState } from 'react';
import StoryCard from './StoryCard.jsx';
import { getStockNews } from '../lib/stocks.js';

// Ticker-specific news, rendered with the shared StoryCard (which carries its own
// ✦ Summarise button). Google News items are external links, so they open in a new tab.
export default function StockNews({ symbol }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStockNews(symbol)
      .then((d) => !cancelled && setStories(d.stories || []))
      .catch(() => !cancelled && setStories([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const openStory = (story) =>
    window.open(story.link, '_blank', 'noopener,noreferrer');

  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        {symbol} news
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-40 rounded-lg" />
          ))}
        </div>
      ) : stories.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface p-4 font-mono text-xs text-secondary">
          No recent news for {symbol}.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, i) => (
            <StoryCard key={`${story.link}-${i}`} story={story} onOpen={openStory} />
          ))}
        </div>
      )}
    </section>
  );
}
