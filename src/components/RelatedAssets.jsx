import { Link } from 'react-router-dom';
import { formatPrice, formatPercent } from '../lib/format.js';

// Horizontal-scroll row of same-sector peer cards. Each navigates to that ticker's
// own detail page. Renders nothing when there are no peers (unknown sector, etc.).
export default function RelatedAssets({ peers = [], loading }) {
  if (loading) {
    return (
      <section>
        <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
          Related assets
        </h2>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 w-40 shrink-0 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (!peers.length) return null;

  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        Related assets
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {peers.map((p) => {
          const up = (p.changePercent ?? 0) >= 0;
          return (
            <Link
              key={p.symbol}
              to={`/stock/${encodeURIComponent(p.symbol)}`}
              className="group flex w-44 shrink-0 flex-col gap-1 rounded-lg border border-border bg-surface p-3 transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface/90"
            >
              <span className="font-mono text-sm font-semibold text-primary group-hover:text-accent">
                {p.symbol}
              </span>
              <span className="truncate font-body text-xs text-secondary" title={p.name}>
                {p.name}
              </span>
              <div className="mt-1 flex items-baseline justify-between font-mono text-xs">
                <span className="text-primary">{formatPrice(p.price)}</span>
                <span style={{ color: up ? '#22c55e' : '#ef4444' }}>
                  {formatPercent(p.changePercent)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
