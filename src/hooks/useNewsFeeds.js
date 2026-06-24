import { useCallback, useEffect, useState } from 'react';

// Fetches aggregated stories from /api/news. User-driven: loads once on mount,
// and re-fetches when refresh() is called. No caching, no auto-refresh.
export function useNewsFeeds() {
  const [stories, setStories] = useState([]);
  const [failed, setFailed] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`News fetch failed (${res.status})`);
      const data = await res.json();
      setStories(data.stories || []);
      setFailed(data.failed || []);
      setFetchedAt(data.fetchedAt || new Date().toISOString());
    } catch (err) {
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stories, failed, fetchedAt, loading, error, refresh };
}
