// A live scrolling marquee of prices, terminal-style: market indices first, then a
// divider, then the user's watchlist. The track renders the sequence twice so the
// -50% translate loop is seamless; it pauses on hover. Watchlist/equity symbols link
// to their stock page; indices, crypto, and FX pairs are not navigable.

import { Link } from 'react-router-dom';

function formatPrice(value) {
  // Whole-number grouping for large values (indices, BTC), 2 decimals for the rest,
  // 4 for sub-dollar values like FX pairs.
  const decimals = value >= 1000 ? 0 : value < 1 ? 4 : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Indices (^GSPC), crypto (BTC-USD), and FX pairs (AUDUSD=X) have no stock page.
function isEquity(symbol) {
  return !/^\^/.test(symbol) && !/-USD$/.test(symbol) && !/=X$/.test(symbol);
}

function Quote({ q, interactive }) {
  const up = q.changePercent >= 0;
  const color = up ? '#22c55e' : '#ef4444';

  const inner = (
    <>
      <span className="font-semibold text-primary">{q.label}</span>
      <span className="text-secondary">{formatPrice(q.price)}</span>
      <span style={{ color }}>
        {up ? '▲' : '▼'}
        {Math.abs(q.changePercent).toFixed(2)}%
      </span>
    </>
  );

  const base = 'flex items-center gap-2 whitespace-nowrap px-5 font-mono text-xs';

  if (isEquity(q.symbol)) {
    return (
      <li>
        <Link
          to={`/stock/${encodeURIComponent(q.symbol)}`}
          tabIndex={interactive ? 0 : -1}
          className={`${base} rounded-sm transition hover:bg-accent/10`}
        >
          {inner}
        </Link>
      </li>
    );
  }

  return <li className={base}>{inner}</li>;
}

export default function TickerBar({ indices = [], watchlist = [], loading }) {
  const combined = [
    ...indices.map((q) => ({ ...q, group: 'index' })),
    ...watchlist.map((q) => ({ ...q, group: 'watch' })),
  ];

  if (loading && combined.length === 0) {
    return (
      <div className="border-b border-border bg-surface/40">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-2 sm:px-6">
          <div className="skeleton h-3 w-full" />
        </div>
      </div>
    );
  }

  if (!combined.length) return null;

  return (
    <div className="group relative overflow-hidden border-b border-border bg-surface/40">
      {/* Edge fades so prices emerge/exit softly. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg to-transparent" />

      <div className="flex w-max animate-ticker py-2 group-hover:[animation-play-state:paused]">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {indices.map((q, i) => (
              <Quote key={`i-${dup}-${q.symbol}-${i}`} q={q} interactive={dup === 0} />
            ))}
            {watchlist.length > 0 && (
              <li
                aria-hidden="true"
                className="mx-2 h-4 w-px shrink-0 bg-border"
              />
            )}
            {watchlist.map((q, i) => (
              <Quote key={`w-${dup}-${q.symbol}-${i}`} q={q} interactive={dup === 0} />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
