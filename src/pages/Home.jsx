import { useEffect, useState } from 'react';
import FeaturedStory from '../components/FeaturedStory.jsx';
import NewsGrid from '../components/NewsGrid.jsx';
import CategoryBar from '../components/CategoryBar.jsx';
import AIBriefing from '../components/AIBriefing.jsx';
import ArticleReader from '../components/ArticleReader.jsx';
import { useNewsFeeds } from '../hooks/useNewsFeeds.js';
import { getBriefingAndFeatured } from '../lib/ai.js';
import { CATEGORIES, matchesCategory, categoryCounts } from '../lib/categories.js';

export default function Home() {
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
        setBriefing({ text: res.briefing });
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

  // The story currently open in the full-screen reader, if any.
  const [activeStory, setActiveStory] = useState(null);

  // Active category filter chip, remembered across sessions.
  const [category, setCategory] = useState(
    () => localStorage.getItem('phineas.category') || 'all'
  );
  const changeCategory = (id) => {
    setCategory(id);
    localStorage.setItem('phineas.category', id);
  };

  const counts = categoryCounts(gridStories);
  const visibleStories = gridStories.filter((s) => matchesCategory(s, category));
  // Hide the featured card when it doesn't fit the chosen lens.
  const showFeatured =
    !loading && featured && (category === 'all' || matchesCategory(featured, category));
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label || '';

  // Readable sources open in the in-app reader; non-readable (free but not
  // extractable, e.g. Yahoo) open the original site directly.
  const openStory = (story) => {
    if (story.readable === false) {
      window.open(story.link, '_blank', 'noopener,noreferrer');
    } else {
      setActiveStory(story);
    }
  };

  const refreshedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <>
      {/* Feed status + manual refresh — a Home-only concern, so it lives with the
          news it controls rather than in the shared shell header. */}
      <div className="flex items-center justify-end gap-3">
        <span className="hidden items-center gap-1.5 font-mono text-xs text-secondary sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_1px_rgba(74,222,128,0.7)]" />
          updated {refreshedLabel}
        </span>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition hover:bg-accent/20 hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.6)] disabled:opacity-50"
        >
          <span className={loading ? 'inline-block animate-spin' : ''}>↻</span>
          {loading ? 'Loading' : 'Refresh'}
        </button>
      </div>

      <AIBriefing
        briefing={briefing?.text}
        loading={briefingLoading || (loading && stories.length === 0)}
        error={briefingError}
      />

      {showFeatured && <FeaturedStory story={featured} onOpen={openStory} />}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && (
        <CategoryBar active={category} counts={counts} onChange={changeCategory} />
      )}

      <NewsGrid
        stories={visibleStories}
        loading={loading}
        onOpen={openStory}
        emptyMessage={`No ${categoryLabel} stories right now.`}
      />

      {activeStory && (
        <ArticleReader story={activeStory} onClose={() => setActiveStory(null)} />
      )}
    </>
  );
}
