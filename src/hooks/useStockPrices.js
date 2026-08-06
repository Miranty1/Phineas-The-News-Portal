import { useEffect, useRef, useState } from 'react';

// Fetches stock quotes from /api/stocks on mount, then silently re-fetches every
// `intervalMs` (default 60s) so the ticker stays live. Independent of the news feed.
//
// `symbols` is an optional array of tickers; when provided they're passed through
// as ?symbols= and the fetch re-subscribes whenever the set changes. With no
// symbols the endpoint returns the fixed market indices.
export function useStockPrices(symbols, intervalMs = 60000) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  // `undefined` symbols means "market indices"; an explicit (possibly empty) array
  // means "these tickers". Stable primitive key so the effect only re-runs when the
  // actual set changes, not on every render's new array identity.
  const scoped = Array.isArray(symbols);
  const key = scoped ? symbols.join(',') : null;

  useEffect(() => {
    alive.current = true;

    // Explicit empty watchlist: nothing to fetch, show nothing.
    if (scoped && key === '') {
      setQuotes([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);

    async function load() {
      try {
        const url = scoped ? `/api/stocks?symbols=${encodeURIComponent(key)}` : '/api/stocks';
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (alive.current && data.quotes) setQuotes(data.quotes);
      } catch {
        // Leave the last good quotes in place on a transient failure.
      } finally {
        if (alive.current) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [scoped, key, intervalMs]);

  return { quotes, loading };
}
