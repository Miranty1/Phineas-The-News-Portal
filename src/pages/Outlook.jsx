import { useEffect, useMemo, useState } from 'react';
import MarketOutlook from '../components/MarketOutlook.jsx';
import AnalystTargets from '../components/AnalystTargets.jsx';
import MarketSentiment from '../components/MarketSentiment.jsx';
import SectorPerformance from '../components/SectorPerformance.jsx';
import KeyEvents from '../components/KeyEvents.jsx';
import { useNewsFeeds } from '../hooks/useNewsFeeds.js';
import { useWatchlist } from '../hooks/useWatchlist.js';
import { useWatchlistDetails } from '../hooks/useWatchlistDetails.js';
import { useStockPrices } from '../hooks/useStockPrices.js';
import { getMarketOutlook } from '../lib/ai.js';
import { SECTOR_ETFS } from '../lib/outlook.js';

const VIX_AND_SECTORS = ['^VIX', ...SECTOR_ETFS];

export default function Outlook() {
  const { stories, loading: newsLoading } = useNewsFeeds();
  const { watchlist } = useWatchlist();
  const { details, loading: detailsLoading } = useWatchlistDetails(watchlist);
  const { quotes, loading: quotesLoading } = useStockPrices(VIX_AND_SECTORS);

  // One combined Gemini call powers both the essay and the sentiment gauge.
  const [ai, setAi] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    if (newsLoading || stories.length === 0) return;
    let cancelled = false;
    setAiLoading(true);
    setAiError(null);
    getMarketOutlook(stories)
      .then((res) => !cancelled && setAi(res))
      .catch((err) => !cancelled && setAiError(err.message || 'AI outlook failed'))
      .finally(() => !cancelled && setAiLoading(false));
    return () => {
      cancelled = true;
    };
  }, [stories, newsLoading]);

  // Index the VIX + sector quotes by symbol for the two consumers.
  const quotesBySymbol = useMemo(() => {
    const map = {};
    for (const q of quotes) map[q.symbol] = q;
    return map;
  }, [quotes]);
  const vix = quotesBySymbol['^VIX']?.price ?? null;

  const outlookLoading = aiLoading || (newsLoading && !ai);

  return (
    <div className="space-y-8">
      <MarketOutlook outlook={ai?.outlook} loading={outlookLoading} error={aiError} />

      <AnalystTargets details={details} loading={detailsLoading} />

      <MarketSentiment
        vix={vix}
        sentiment={ai?.sentiment}
        confidence={ai?.confidence}
        sentimentReason={ai?.sentimentReason}
        loading={outlookLoading}
        aiError={aiError}
      />

      <SectorPerformance quotesBySymbol={quotesBySymbol} loading={quotesLoading} />

      <KeyEvents details={details} loading={detailsLoading} />
    </div>
  );
}
