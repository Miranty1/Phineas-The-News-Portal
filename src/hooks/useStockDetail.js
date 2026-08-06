import { useEffect, useState } from 'react';
import { getStockDetail } from '../lib/stocks.js';

// Fetches consolidated stock detail for `symbol`, refetching whenever it changes
// (e.g. navigating peer -> peer). Mirrors the shape of useNewsFeeds.
export function useStockDetail(symbol) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    getStockDetail(symbol)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load stock');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  return { data, loading, error };
}
