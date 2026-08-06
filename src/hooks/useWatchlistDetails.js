import { useEffect, useState } from 'react';
import { getStockDetail } from '../lib/stocks.js';

// Fetches full detail for every watchlist symbol in parallel, so the Outlook page
// can feed both the analyst-targets table and the key-events earnings list from a
// single set of requests. Failed tickers are simply dropped. Refetches when the
// watchlist changes.
export function useWatchlistDetails(watchlist) {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stable key so the effect only re-runs when the actual set changes.
  const key = watchlist.join(',');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (watchlist.length === 0) {
      setDetails([]);
      setLoading(false);
      return () => {};
    }

    Promise.allSettled(watchlist.map((s) => getStockDetail(s)))
      .then((results) => {
        if (cancelled) return;
        setDetails(
          results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { details, loading };
}
