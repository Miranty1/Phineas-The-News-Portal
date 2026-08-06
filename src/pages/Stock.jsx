import { Link, useParams } from 'react-router-dom';

// Milestone A stub. The full stock detail page (header/metrics, interactive chart,
// sector peers, ticker news, AI outlook) lands in Milestone B; this proves routing,
// search, and ticker-click navigation end-to-end.
export default function Stock() {
  const { ticker } = useParams();
  const symbol = (ticker || '').toUpperCase();

  return (
    <section className="animate-fadeIn rounded-lg border border-border bg-surface px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-secondary">Stock</p>
      <h2 className="mt-1 font-mono text-4xl font-bold tracking-tight text-primary">
        {symbol}
      </h2>
      <p className="mt-4 max-w-prose font-body text-sm leading-relaxed text-secondary">
        The full detail view — live quote and key metrics, an interactive price chart,
        sector peers, ticker news, and an AI outlook — arrives in the next build. For now
        this confirms navigation to{' '}
        <span className="font-mono text-accent">/stock/{symbol}</span> is working.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition hover:bg-accent/20"
      >
        ← Back to dashboard
      </Link>
    </section>
  );
}
