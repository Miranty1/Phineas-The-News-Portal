import { vixLabel } from '../lib/outlook.js';
import { formatNumber } from '../lib/format.js';

const SENTIMENT_COLOR = {
  Bullish: '#22c55e',
  Bearish: '#ef4444',
  Neutral: '#9ca3af',
};

const VIX_TONE = {
  calm: '#22c55e',
  neutral: '#9ca3af',
  warn: '#f59e0b',
  danger: '#ef4444',
};

function Card({ children }) {
  return <div className="rounded-lg border border-border bg-surface p-5">{children}</div>;
}

export default function MarketSentiment({ vix, sentiment, confidence, sentimentReason, loading, aiError }) {
  const vx = vixLabel(vix);

  return (
    <section>
      <h2 className="mb-3 font-mono text-sm uppercase tracking-wider text-secondary">
        Market sentiment
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* VIX gauge */}
        <Card>
          <p className="font-mono text-[11px] uppercase tracking-wider text-secondary">
            Volatility (VIX)
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-primary">
              {vix == null ? '–' : formatNumber(vix)}
            </span>
            <span className="font-mono text-sm" style={{ color: VIX_TONE[vx.tone] }}>
              {vx.label}
            </span>
          </div>
          <p className="mt-3 font-body text-xs leading-relaxed text-secondary">
            The CBOE Volatility Index gauges expected S&amp;P 500 swings — lower is calmer,
            higher signals fear.
          </p>
        </Card>

        {/* AI news sentiment */}
        <Card>
          <p className="font-mono text-[11px] uppercase tracking-wider text-secondary">
            News sentiment <span className="text-aipick">✦</span>
          </p>

          {loading ? (
            <div className="mt-3 space-y-2">
              <div className="skeleton h-8 w-32" />
              <div className="skeleton h-3 w-full" />
            </div>
          ) : aiError ? (
            <p className="mt-3 font-mono text-xs text-secondary">Unavailable ({aiError}).</p>
          ) : (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="font-mono text-3xl font-bold"
                  style={{ color: SENTIMENT_COLOR[sentiment] || '#9ca3af' }}
                >
                  {sentiment}
                </span>
                <span className="font-mono text-sm text-secondary">{confidence}% conf.</span>
              </div>
              {/* Confidence bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${confidence || 0}%`,
                    background: SENTIMENT_COLOR[sentiment] || '#9ca3af',
                  }}
                />
              </div>
              {sentimentReason && (
                <p className="mt-3 font-body text-xs leading-relaxed text-secondary">
                  {sentimentReason}
                </p>
              )}
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
