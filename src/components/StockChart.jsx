import { useEffect, useMemo, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { getCandles } from '../lib/stocks.js';
import { formatCompact } from '../lib/format.js';

const RANGES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

// Simple moving average over the close series; leading points (fewer than `period`
// samples) are omitted so the line starts where it becomes meaningful.
function movingAverage(candles, period) {
  const out = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

export default function StockChart({ symbol, currency = 'USD' }) {
  const [range, setRange] = useState('1M');
  const [type, setType] = useState('line'); // 'line' | 'candlestick'
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef({});
  const typeRef = useRef(type); // read inside the crosshair closure to avoid staleness

  // Fetch candles whenever the ticker or range changes.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCandles(symbol, range)
      .then((d) => !cancelled && setCandles(d.candles || []))
      .catch((err) => !cancelled && setError(err.message || 'Chart data failed'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  // Create the chart once; wire resize + crosshair; dispose on unmount.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: 'rgba(31,41,55,0.6)' },
        horzLines: { color: 'rgba(31,41,55,0.6)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: '#1f2937' },
      timeScale: { borderColor: '#1f2937', timeVisible: true, secondsVisible: false },
      height: 360,
      autoSize: false,
    });
    chartRef.current = chart;

    const line = chart.addLineSeries({ color: '#22d3ee', lineWidth: 2, priceLineVisible: false });
    const candle = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      borderVisible: false,
      visible: false,
    });
    const ma20 = chart.addLineSeries({ color: '#a78bfa', lineWidth: 1, priceLineVisible: false, crosshairMarkerVisible: false });
    const ma50 = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1, priceLineVisible: false, crosshairMarkerVisible: false });
    const volume = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    seriesRef.current = { line, candle, ma20, ma50, volume };

    // Crosshair tooltip: read the hovered bar off whichever price series is visible.
    const onMove = (param) => {
      if (!param.time || !param.point) {
        setTooltip(null);
        return;
      }
      const active = typeRef.current === 'candlestick' ? candle : line;
      const bar = param.seriesData.get(active);
      const vol = param.seriesData.get(volume);
      if (!bar) {
        setTooltip(null);
        return;
      }
      setTooltip({
        x: param.point.x,
        o: bar.open,
        h: bar.high,
        l: bar.low,
        c: bar.close ?? bar.value,
        v: vol?.value,
      });
    };
    chart.subscribeCrosshairMove(onMove);

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (w) chart.applyOptions({ width: Math.floor(w) });
    });
    ro.observe(el);
    chart.applyOptions({ width: el.clientWidth });

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = {};
    };
    // Recreate only on unmount/mount; `type` is captured for the tooltip closure but
    // toggling is handled in the visibility effect below without a full rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push data into the series when candles change.
  useEffect(() => {
    const s = seriesRef.current;
    if (!s.line || candles.length === 0) return;

    s.line.setData(candles.map((c) => ({ time: c.time, value: c.close })));
    s.candle.setData(
      candles.map((c) => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close }))
    );
    s.ma20.setData(movingAverage(candles, 20));
    s.ma50.setData(movingAverage(candles, 50));
    s.volume.setData(
      candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
      }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Toggle line vs candlestick without rebuilding the chart.
  useEffect(() => {
    typeRef.current = type;
    const s = seriesRef.current;
    if (!s.line) return;
    s.line.applyOptions({ visible: type === 'line' });
    s.candle.applyOptions({ visible: type === 'candlestick' });
  }, [type]);

  const tabBtn = (active) =>
    [
      'rounded px-2.5 py-1 font-mono text-xs transition',
      active
        ? 'bg-accent/15 text-accent'
        : 'text-secondary hover:bg-surface hover:text-primary',
    ].join(' ');

  const legend = useMemo(
    () => (
      <div className="flex items-center gap-3 font-mono text-[11px] text-secondary">
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: '#a78bfa' }} />MA20</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: '#f59e0b' }} />MA50</span>
      </div>
    ),
    []
  );

  return (
    <section className="animate-fadeIn rounded-lg border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)} className={tabBtn(range === r)}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {legend}
          <div className="flex items-center gap-1 rounded border border-border p-0.5">
            <button onClick={() => setType('line')} className={tabBtn(type === 'line')}>Line</button>
            <button onClick={() => setType('candlestick')} className={tabBtn(type === 'candlestick')}>Candles</button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={containerRef} className="h-[360px] w-full" />

        {/* Crosshair OHLCV readout, pinned to the top of the plot. */}
        {tooltip && (
          <div
            className="pointer-events-none absolute left-2 top-2 flex gap-3 rounded border border-border bg-bg/90 px-2.5 py-1.5 font-mono text-[11px] backdrop-blur-sm"
          >
            <span className="text-secondary">O <span className="text-primary">{tooltip.o?.toFixed(2)}</span></span>
            <span className="text-secondary">H <span className="text-primary">{tooltip.h?.toFixed(2)}</span></span>
            <span className="text-secondary">L <span className="text-primary">{tooltip.l?.toFixed(2)}</span></span>
            <span className="text-secondary">C <span className="text-primary">{tooltip.c?.toFixed(2)}</span></span>
            {tooltip.v != null && (
              <span className="text-secondary">V <span className="text-primary">{formatCompact(tooltip.v)}</span></span>
            )}
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60">
            <div className="skeleton h-3 w-40" />
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-secondary">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}
