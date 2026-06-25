import StoryCard from './StoryCard.jsx';

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-3 flex justify-between">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-4 w-12" />
      </div>
      <div className="skeleton mb-2 h-4 w-full" />
      <div className="skeleton mb-4 h-4 w-10/12" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton mt-1.5 h-3 w-8/12" />
    </div>
  );
}

// Responsive grid: 3 cols desktop / 2 tablet / 1 mobile. On load, cards cascade
// in with a staggered per-index delay.
export default function NewsGrid({ stories, loading, onOpen, emptyMessage }) {
  if (!loading && stories.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface/40 px-4 py-12 text-center font-mono text-sm text-secondary">
        {emptyMessage || 'No stories right now.'}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {loading
        ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
        : stories.map((story, i) => (
            <div
              key={`${story.link}-${i}`}
              className="animate-cardReveal"
              style={{ animationDelay: `${Math.min(i * 45, 600)}ms` }}
            >
              <StoryCard story={story} onOpen={onOpen} />
            </div>
          ))}
    </section>
  );
}
