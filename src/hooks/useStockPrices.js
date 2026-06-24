import { useEffect, useRef, useState } from 'react';

// Fetches stock quotes from /api/stocks on mount, then silently re-fetches every
// `intervalMs` (default 60s) so the ticker stays live. Independent of the news feed.
export function useStockPrices(intervalMs = 60000) {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;

    async function load() {
      try {
        const res = await fetch('/api/stocks');
        if (!res.ok) return;
        const data = await res.json();
        if (alive.current && data.quotes?.length) setQuotes(data.quotes);
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
  }, [intervalMs]);

  return { quotes, loading };
}
