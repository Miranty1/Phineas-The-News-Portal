import { useTypewriter } from '../hooks/useTypewriter.js';

// Picks the heading from the user's *local* time (this runs in the browser, so it
// reflects the viewer's timezone rather than the UTC server clock).
function timeOfDayLabel() {
  const h = new Date().getHours();
  if (h < 12) return "This Morning's Briefing";
  if (h < 17) return 'Midday Update';
  return 'Evening Wrap';
}

// Hero AI briefing panel. Shows a shimmering skeleton while the AI call is in
// flight, then types the briefing out like a live terminal feed.
export default function AIBriefing({ briefing, loading, error }) {
  const { text, done } = useTypewriter(!loading && !error ? briefing : '');

  return (
    <section className="animate-riseIn overflow-hidden rounded-xl border border-border bg-surface/50 p-5 shadow-[0_0_40px_-12px_rgba(34,211,238,0.25)] backdrop-blur-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded bg-aipick/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-aipick">
          ✦ AI
        </span>
        <h2 className="font-mono text-lg font-semibold text-primary">
          {timeOfDayLabel()}
        </h2>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-9/12" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-secondary">
          The AI briefing is unavailable right now — the latest stories are below.
        </p>
      )}

      {!loading && !error && briefing && (
        <p className="font-mono text-[15px] leading-relaxed text-primary/90">
          <span className="text-accent/70">&gt; </span>
          {text}
          {!done && <span className="cursor-blink" aria-hidden="true" />}
        </p>
      )}
    </section>
  );
}
