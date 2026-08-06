import { Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header.jsx';
import TickerBar from './components/TickerBar.jsx';
import Home from './pages/Home.jsx';
import Outlook from './pages/Outlook.jsx';
import Stock from './pages/Stock.jsx';
import { useStockPrices } from './hooks/useStockPrices.js';
import { useWatchlist } from './hooks/useWatchlist.js';

// The persistent shell shared by every route: the header (branding, nav, search)
// and the live ticker bar. Page content renders through the <Outlet />.
function Shell() {
  const { quotes: indices, loading: indicesLoading } = useStockPrices();
  const { watchlist } = useWatchlist();
  const { quotes: watchQuotes, loading: watchLoading } = useStockPrices(watchlist);

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <TickerBar
        indices={indices}
        watchlist={watchQuotes}
        loading={indicesLoading || watchLoading}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <Outlet />

        <footer className="pb-8 pt-4 text-center font-mono text-[11px] text-secondary/70">
          Phineas · finance news aggregated from public RSS · summaries by Gemini
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/outlook" element={<Outlook />} />
        <Route path="/stock/:ticker" element={<Stock />} />
      </Route>
    </Routes>
  );
}
