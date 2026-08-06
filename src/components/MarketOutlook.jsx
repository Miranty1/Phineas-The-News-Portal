// AI market outlook essay. Receives the already-fetched outlook text + state from
// the page (the same combined Gemini call also feeds MarketSentiment, so it's made
// once). Fails soft on Gemini quota, matching AIBriefing.
export default function MarketOutlook({ outlook, loading, error }) {
  return (
    <section className="animate-fadeIn rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-mono text-sm uppercase tracking-wider text-secondary">
          AI market outlook
        </h2>
        <span className="font-mono text-[11px] text-aipick">✦</span>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-3 w-full" />
          ))}
          <div className="skeleton h-3 w-2/3" />
        </div>
      )}

      {error && !loading && (
        <p className="font-mono text-xs leading-relaxed text-secondary">
          The AI outlook is unavailable right now ({error}). The free Gemini tier has a
          daily limit; the market data below is unaffected.
        </p>
      )}

      {outlook && !loading && (
        <div className="space-y-3 font-body text-sm leading-relaxed text-primary [text-wrap:pretty]">
          {outlook.split(/\n\n+/).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </section>
  );
}
