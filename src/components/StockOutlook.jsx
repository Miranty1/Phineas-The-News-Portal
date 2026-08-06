import { useEffect, useState } from 'react';
import { getCandles, getStockNews } from '../lib/stocks.js';
import { getStockOutlook } from '../lib/ai.js';

// Average of the last `n` closes — the current MA value fed to the AI prompt.
function latestMA(candles, n) {
  if (candles.length < n) return null;
  const slice = candles.slice(-n);
  return slice.reduce((sum, c) => sum + c.close, 0) / n;
}

const SENTIMENT_STYLES = {
  Bullish: 'border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e]',
  Bearish: 'border-[#ef4444]/40 bg-[#ef4444]/10 text-[#ef4444]',
  Neutral: 'border-border bg-surface text-secondary',
};

function Panel({ title, children }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wider text-secondary">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function StockOutlook({ stock }) {
  const [outlook, setOutlook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stock?.symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setOutlook(null);

    // Enrich the detail with MA values + recent headlines, then ask the model once.
    Promise.all([
      getCandles(stock.symbol, '6M').catch(() => ({ candles: [] })),
      getStockNews(stock.symbol).catch(() => ({ stories: [] })),
    ])
      .then(([{ candles = [] }, { stories = [] }]) =>
        getStockOutlook({
          ...stock,
          ma20: latestMA(candles, 20),
          ma50: latestMA(candles, 50),
          headlines: stories.slice(0, 5).map((s) => s.title),
        })
      )
      .then((res) => !cancelled && setOutlook(res))
      .catch((err) => !cancelled && setError(err.message || 'AI outlook failed'))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [stock]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="font-mono text-sm uppercase tracking-wider text-secondary">
          AI stock outlook
        </h2>
        <span className="font-mono text-[11px] text-aipick">✦</span>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
        </div>
      )}

      {error && !loading && (
        <p className="rounded-lg border border-border bg-surface p-4 font-mono text-xs leading-relaxed text-secondary">
          AI outlook is unavailable right now ({error}). The free Gemini tier has a daily
          limit; market data above is unaffected.
        </p>
      )}

      {outlook && !loading && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-4">
            <span
              className={`inline-flex items-center rounded border px-2.5 py-1 font-mono text-xs font-semibold ${
                SENTIMENT_STYLES[outlook.sentiment] || SENTIMENT_STYLES.Neutral
              }`}
            >
              {outlook.sentiment}
            </span>
            <p className="flex-1 font-body text-sm text-primary">{outlook.sentimentReason}</p>
          </div>

          {outlook.technicalSummary && (
            <Panel title="Technical summary">
              <p className="font-body text-sm leading-relaxed text-primary">
                {outlook.technicalSummary}
              </p>
            </Panel>
          )}

          {outlook.outlook && (
            <Panel title="Outlook">
              <div className="space-y-3 font-body text-sm leading-relaxed text-primary [text-wrap:pretty]">
                {outlook.outlook.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </Panel>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {outlook.analystSummary && (
              <Panel title="Analyst summary">
                <p className="font-body text-sm leading-relaxed text-primary">
                  {outlook.analystSummary}
                </p>
              </Panel>
            )}
            {outlook.earningsSnapshot && (
              <Panel title="Earnings snapshot">
                <p className="font-body text-sm leading-relaxed text-primary">
                  {outlook.earningsSnapshot}
                </p>
              </Panel>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
