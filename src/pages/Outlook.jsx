// Milestone A stub. The full Outlook page (AI market outlook, analyst price targets,
// sentiment gauge, sector performance, key events) lands in Milestone C.
export default function Outlook() {
  return (
    <section className="animate-fadeIn rounded-lg border border-border bg-surface px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-secondary">Outlook</p>
      <h2 className="mt-1 font-mono text-4xl font-bold tracking-tight text-primary">
        Market Outlook
      </h2>
      <p className="mt-4 max-w-prose font-body text-sm leading-relaxed text-secondary">
        A deeper daily read — AI market analysis, analyst price targets for your watchlist,
        sentiment indicators, and sector performance — is on the way in a later build.
      </p>
    </section>
  );
}
