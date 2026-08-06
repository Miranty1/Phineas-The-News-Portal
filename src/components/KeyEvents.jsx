import { MACRO_EVENTS } from '../lib/outlook.js';
import { formatDate } from '../lib/format.js';

const TYPE_TONE = {
  Earnings: 'border-aipick/40 bg-aipick/10 text-aipick',
  Fed: 'border-accent/40 bg-accent/10 text-accent',
  Inflation: 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]',
  Jobs: 'border-border bg-bg text-secondary',
};

// Merge upcoming watchlist earnings (unix-seconds dates) with the curated macro list
// (ISO dates), keep only future events, sort ascending. `details` come from
// useWatchlistDetails.
function buildEvents(details) {
  const startOfToday = new Date().setHours(0, 0, 0, 0);

  const earnings = details
    .filter((d) => d.earnings?.date)
    .map((d) => ({
      ts: d.earnings.date * 1000,
      unix: d.earnings.date,
      label: `${d.symbol} earnings`,
      type: 'Earnings',
    }));

  const macro = MACRO_EVENTS.map((e) => {
    const ts = new Date(e.date + 'T00:00:00').getTime();
    return { ts, unix: Math.floor(ts / 1000), label: e.label, type: e.type };
  });

  return [...earnings, ...macro]
    .filter((e) => e.ts >= startOfToday)
    .sort((a, b) => a.ts - b.ts)
    .slice(0, 10);
}

export default function KeyEvents({ details = [], loading }) {
  const events = buildEvents(details);

  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        Key events ahead
      </h2>

      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-4 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <p className="p-4 font-mono text-xs text-secondary">No upcoming events.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {events.map((e, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 font-mono text-xs text-secondary">
                    {formatDate(e.unix)}
                  </span>
                  <span className="font-body text-sm text-primary">{e.label}</span>
                </div>
                <span
                  className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                    TYPE_TONE[e.type] || TYPE_TONE.Jobs
                  }`}
                >
                  {e.type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
