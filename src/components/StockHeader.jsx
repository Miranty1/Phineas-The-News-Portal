import { useWatchlist } from '../hooks/useWatchlist.js';
import { formatPrice, formatCompact, formatNumber } from '../lib/format.js';

function Metric({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-mono text-[11px] uppercase tracking-wider text-secondary">
        {label}
      </dt>
      <dd className="font-mono text-sm text-primary">{value}</dd>
    </div>
  );
}

export default function StockHeader({ stock }) {
  const { has, addTicker, removeTicker } = useWatchlist();
  const inList = has(stock.symbol);

  const up = (stock.changePercent ?? 0) >= 0;
  const changeColor = up ? 'text-[#22c55e]' : 'text-[#ef4444]';
  const currency = stock.currency || 'USD';

  return (
    <section className="animate-fadeIn rounded-lg border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-primary">
              {stock.symbol}
            </h1>
            {stock.exchange && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-secondary">
                {stock.exchange}
              </span>
            )}
          </div>
          <p className="mt-0.5 font-body text-sm text-secondary">{stock.name}</p>
        </div>

        <button
          onClick={() => (inList ? removeTicker(stock.symbol) : addTicker(stock.symbol))}
          aria-pressed={inList}
          className={[
            'inline-flex items-center gap-1.5 rounded border px-3 py-1.5 font-mono text-xs transition',
            inList
              ? 'border-aipick/40 bg-aipick/10 text-aipick hover:bg-aipick/20'
              : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:shadow-[0_0_14px_-2px_rgba(34,211,238,0.6)]',
          ].join(' ')}
        >
          {inList ? '✓ In watchlist' : '+ Add to watchlist'}
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-mono text-4xl font-bold tabular-nums text-primary">
          {formatPrice(stock.price, currency)}
        </span>
        <span className={`font-mono text-base tabular-nums ${changeColor}`}>
          {up ? '▲' : '▼'} {formatPrice(Math.abs(stock.change ?? 0), currency)} (
          {up ? '+' : ''}
          {formatNumber(stock.changePercent)}%)
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Market cap" value={formatCompact(stock.marketCap)} />
        <Metric label="P/E" value={formatNumber(stock.peRatio)} />
        <Metric
          label="52W range"
          value={`${formatPrice(stock.low52, currency)} – ${formatPrice(stock.high52, currency)}`}
        />
        <Metric label="Day range" value={`${formatPrice(stock.dayLow, currency)} – ${formatPrice(stock.dayHigh, currency)}`} />
        <Metric label="Volume" value={formatCompact(stock.volume)} />
        <Metric label="Avg volume" value={formatCompact(stock.avgVolume)} />
      </dl>
    </section>
  );
}
