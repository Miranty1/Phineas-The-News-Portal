// A live scrolling marquee of stock/index prices, terminal-style. The track
// renders the quotes twice so the -50% translate loop is seamless; it pauses on
// hover. Renders a quiet shimmer line until quotes arrive.

function formatPrice(value) {
  // Whole-number grouping for large values (indices, BTC), 2 decimals for the rest.
  const decimals = value >= 1000 ? 0 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function Quote({ q }) {
  const up = q.changePercent >= 0;
  const color = up ? '#22c55e' : '#ef4444';
  return (
    <li className="flex items-center gap-2 whitespace-nowrap px-5 font-mono text-xs">
      <span className="font-semibold text-primary">{q.label}</span>
      <span className="text-secondary">{formatPrice(q.price)}</span>
      <span style={{ color }}>
        {up ? '▲' : '▼'}
        {Math.abs(q.changePercent).toFixed(2)}%
      </span>
    </li>
  );
}

export default function Ticker({ quotes, loading }) {
  if (loading && quotes.length === 0) {
    return (
      <div className="border-b border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-2 sm:px-6">
          <div className="skeleton h-3 w-full" />
        </div>
      </div>
    );
  }

  if (!quotes.length) return null;

  return (
    <div className="group relative overflow-hidden border-b border-border bg-surface/40">
      {/* Edge fades so prices emerge/exit softly. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent" />

      <div className="flex w-max animate-ticker py-2 group-hover:[animation-play-state:paused]">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
            {quotes.map((q, i) => (
              <Quote key={`${dup}-${q.symbol}-${i}`} q={q} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
