import { useCallback, useState } from 'react';

// The user's watchlist, persisted to localStorage. Symbols are stored upper-cased
// and de-duplicated. Displayed on the right of the TickerBar; add/remove UI lives
// on the Stock page. Namespaced with a dot to match the existing `phineas.category`.
const STORAGE_KEY = 'phineas.watchlist';
const DEFAULT = ['AAPL', 'MSFT', 'NVDA'];

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(raw) && raw.length) return raw.map((t) => t.toUpperCase());
  } catch {
    // Corrupt or empty — fall through to the default set.
  }
  return DEFAULT;
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(load);

  const persist = useCallback((next) => {
    setWatchlist(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addTicker = useCallback(
    (ticker) => {
      const t = ticker.trim().toUpperCase();
      if (!t) return;
      setWatchlist((prev) => {
        if (prev.includes(t)) return prev;
        const next = [...prev, t];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeTicker = useCallback((ticker) => {
    const t = ticker.trim().toUpperCase();
    setWatchlist((prev) => {
      const next = prev.filter((s) => s !== t);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const has = useCallback(
    (ticker) => watchlist.includes(ticker.trim().toUpperCase()),
    [watchlist]
  );

  return { watchlist, addTicker, removeTicker, has, setWatchlist: persist };
}
