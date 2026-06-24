import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Ticker from './components/Ticker.jsx';
import AIBriefing from './components/AIBriefing.jsx';
import FeaturedStory from './components/FeaturedStory.jsx';
import NewsGrid from './components/NewsGrid.jsx';
import { useNewsFeeds } from './hooks/useNewsFeeds.js';
import { getBriefingAndFeatured } from './lib/ai.js';

export default function App() {
  const { stories, fetchedAt, loading, error, refresh } = useNewsFeeds();

  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(null);

  // Whenever a fresh batch of stories arrives, request the AI briefing + pick.
  useEffect(() => {
    if (loading || stories.length === 0) return;

    let cancelled = false;
    setBriefingLoading(true);
    setBriefingError(null);

    getBriefingAndFeatured(stories)
      .then((res) => {
        if (cancelled) return;
        setBriefing({ text: res.briefing, label: res.label });
        setFeaturedIndex(res.featuredIndex);
      })
      .catch((err) => {
        if (cancelled) return;
        setBriefingError(err.message || 'Briefing failed');
      })
      .finally(() => {
        if (!cancelled) setBriefingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stories, loading]);

  const featured = featuredIndex != null ? stories[featuredIndex] : null;
  // The grid shows every story except the one promoted to "featured".
  const gridStories = featured
    ? stories.filter((_, i) => i !== featuredIndex)
    : stories;

  return (
    <div className="min-h-screen bg-bg">
      <Header fetchedAt={fetchedAt} loading={loading} onRefresh={refresh} />
      <Ticker stories={stories} loading={loading} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <AIBriefing
          label={briefing?.label}
          briefing={briefing?.text}
          loading={briefingLoading || (loading && stories.length === 0)}
          error={briefingError}
        />

        {!loading && featured && <FeaturedStory story={featured} />}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <NewsGrid stories={gridStories} loading={loading} />

        <footer className="pb-8 pt-4 text-center font-mono text-[11px] text-secondary/70">
          Phineas · finance news aggregated from public RSS · summaries by Gemini
        </footer>
      </main>
    </div>
  );
}
