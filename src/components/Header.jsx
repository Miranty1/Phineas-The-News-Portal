export default function Header({ fetchedAt, loading, onRefresh }) {
  const refreshedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
      {/* Thin terminal accent line that draws itself in on load. */}
      <div className="h-0.5 w-full origin-left animate-drawLine bg-gradient-to-r from-accent via-aipick to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-primary">
            Phineas
            <span className="cursor-blink !bg-accent" aria-hidden="true" />
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-secondary">
            The Finance News Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-xs text-secondary sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_1px_rgba(74,222,128,0.7)]" />
            updated {refreshedLabel}
          </span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition hover:bg-accent/20 hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.6)] disabled:opacity-50"
          >
            <span className={loading ? 'inline-block animate-spin' : ''}>↻</span>
            {loading ? 'Loading' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
