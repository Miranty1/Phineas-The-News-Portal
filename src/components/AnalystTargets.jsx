import { Link } from 'react-router-dom';
import { formatPrice, formatPercent } from '../lib/format.js';

// Yahoo recommendationKey -> display label + tone.
const RATINGS = {
  strong_buy: { label: 'Strong Buy', tone: 'buy' },
  buy: { label: 'Buy', tone: 'buy' },
  outperform: { label: 'Outperform', tone: 'buy' },
  hold: { label: 'Hold', tone: 'hold' },
  neutral: { label: 'Hold', tone: 'hold' },
  underperform: { label: 'Underperform', tone: 'sell' },
  sell: { label: 'Sell', tone: 'sell' },
  strong_sell: { label: 'Strong Sell', tone: 'sell' },
};

const TONE_CLASS = {
  buy: 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]',
  hold: 'border-border bg-bg text-secondary',
  sell: 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]',
};

function RatingBadge({ rating }) {
  const r = RATINGS[rating];
  if (!r) return <span className="font-mono text-xs text-secondary">–</span>;
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 font-mono text-[11px] ${TONE_CLASS[r.tone]}`}
    >
      {r.label}
    </span>
  );
}

export default function AnalystTargets({ details = [], loading }) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        Analyst price targets
      </h2>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full min-w-[36rem] text-left font-mono text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-secondary">
              <th className="px-4 py-3 font-medium">Ticker</th>
              <th className="px-4 py-3 text-right font-medium">Current</th>
              <th className="px-4 py-3 text-right font-medium">Target</th>
              <th className="px-4 py-3 text-right font-medium">Upside</th>
              <th className="px-4 py-3 font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/60 last:border-0">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="skeleton h-4 w-full" />
                  </td>
                </tr>
              ))
            ) : details.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-secondary">
                  Your watchlist is empty. Add tickers from any stock page.
                </td>
              </tr>
            ) : (
              details.map((d) => {
                const target = d.analyst?.mean;
                const upside =
                  target != null && d.price ? ((target - d.price) / d.price) * 100 : null;
                const up = (upside ?? 0) >= 0;
                return (
                  <tr key={d.symbol} className="border-b border-border/60 transition last:border-0 hover:bg-bg/40">
                    <td className="px-4 py-3">
                      <Link
                        to={`/stock/${encodeURIComponent(d.symbol)}`}
                        className="font-semibold text-primary hover:text-accent"
                      >
                        {d.symbol}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-primary">
                      {formatPrice(d.price, d.currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-primary">
                      {formatPrice(target, d.currency)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      style={{ color: upside == null ? '#9ca3af' : up ? '#22c55e' : '#ef4444' }}
                    >
                      {upside == null ? '–' : formatPercent(upside)}
                    </td>
                    <td className="px-4 py-3">
                      <RatingBadge rating={d.analyst?.rating} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
