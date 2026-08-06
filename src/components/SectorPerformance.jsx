import { SECTORS } from '../lib/outlook.js';
import { formatPercent } from '../lib/format.js';

// Grid of sector performance, using SPDR sector ETFs as proxies. `quotesBySymbol`
// maps ETF symbol -> quote ({ changePercent }).
export default function SectorPerformance({ quotesBySymbol = {}, loading }) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        Sector performance
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SECTORS.map(({ etf, label }) => {
          const q = quotesBySymbol[etf];
          const pct = q?.changePercent;
          const up = (pct ?? 0) >= 0;
          return (
            <div
              key={etf}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-3"
            >
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary">
                {label}
              </span>
              {loading || pct == null ? (
                <div className="skeleton h-6 w-16" />
              ) : (
                <span
                  className="font-mono text-lg font-semibold tabular-nums"
                  style={{ color: up ? '#22c55e' : '#ef4444' }}
                >
                  {up ? '▲' : '▼'} {formatPercent(pct)}
                </span>
              )}
              <span className="font-mono text-[10px] text-secondary/70">{etf}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
