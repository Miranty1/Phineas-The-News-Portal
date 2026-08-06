import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StockHeader from '../components/StockHeader.jsx';
import StockChart from '../components/StockChart.jsx';
import RelatedAssets from '../components/RelatedAssets.jsx';
import StockNews from '../components/StockNews.jsx';
import StockOutlook from '../components/StockOutlook.jsx';
import { useStockDetail } from '../hooks/useStockDetail.js';
import { getPeers } from '../lib/stocks.js';

export default function Stock() {
  const { ticker } = useParams();
  const symbol = (ticker || '').toUpperCase();

  const { data, loading, error } = useStockDetail(symbol);

  // Peers are independent and non-essential — fetched here so a failure never blocks
  // the rest of the page.
  const [peers, setPeers] = useState([]);
  const [peersLoading, setPeersLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setPeersLoading(true);
    getPeers(symbol)
      .then((d) => !cancelled && setPeers(d.peers || []))
      .catch(() => !cancelled && setPeers([]))
      .finally(() => !cancelled && setPeersLoading(false));
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  // Hard failure to load the core quote: show a message but keep the page navigable.
  if (error && !data) {
    return (
      <section className="animate-fadeIn rounded-lg border border-border bg-surface px-6 py-10">
        <h2 className="font-mono text-2xl font-bold text-primary">{symbol}</h2>
        <p className="mt-3 font-body text-sm text-secondary">
          Couldn't load data for {symbol} ({error}). Check the ticker symbol and try again.
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

  return (
    <div className="space-y-6">
      {data ? (
        <StockHeader stock={data} />
      ) : (
        <div className="skeleton h-48 rounded-lg" />
      )}

      <StockChart symbol={symbol} currency={data?.currency} />

      <RelatedAssets peers={peers} loading={peersLoading} />

      {data && <StockOutlook stock={data} />}

      <StockNews symbol={symbol} />
    </div>
  );
}
