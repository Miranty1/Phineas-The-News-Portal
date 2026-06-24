// A live scrolling marquee of the latest headlines, terminal-style. The track
// renders the items twice so the -50% translate loop is seamless; it pauses on
// hover. Renders a quiet shimmer line until stories arrive.
export default function Ticker({ stories, loading }) {
  if (loading && stories.length === 0) {
    return (
      <div className="border-b border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-2 sm:px-6">
          <div className="skeleton h-3 w-full" />
        </div>
      </div>
    );
  }

  if (!stories.length) return null;

  const items = stories.slice(0, 18);

  return (
    <div className="group relative overflow-hidden border-b border-border bg-surface/40">
      {/* Edge fades so headlines emerge/exit softly. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent" />

      <div className="flex w-max animate-ticker py-2 group-hover:[animation-play-state:paused]">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
            {items.map((s, i) => (
              <li
                key={`${dup}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap px-5 font-mono text-xs"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.sourceColor, boxShadow: `0 0 6px 0 ${s.sourceColor}` }}
                />
                <span className="font-semibold" style={{ color: s.sourceColor }}>
                  {s.source}
                </span>
                <span className="text-secondary">{s.title}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
