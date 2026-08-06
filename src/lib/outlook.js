// Static reference data for the Outlook page.

// Sector SPDR ETFs used as proxies for sector performance, in display order.
export const SECTORS = [
  { etf: 'XLK', label: 'Technology' },
  { etf: 'XLF', label: 'Financials' },
  { etf: 'XLE', label: 'Energy' },
  { etf: 'XLV', label: 'Healthcare' },
  { etf: 'XLY', label: 'Consumer' },
  { etf: 'XLI', label: 'Industrials' },
  { etf: 'XLB', label: 'Materials' },
  { etf: 'XLU', label: 'Utilities' },
];

export const SECTOR_ETFS = SECTORS.map((s) => s.etf);

// Curated recurring US macro events. There is no keyless economic-calendar API, so
// these dates are maintained by hand — UPDATE PERIODICALLY. Past dates are filtered
// out at render time, so stale entries drop off rather than mislead.
export const MACRO_EVENTS = [
  { date: '2026-08-12', label: 'US CPI (July)', type: 'Inflation' },
  { date: '2026-08-13', label: 'US PPI (July)', type: 'Inflation' },
  { date: '2026-08-21', label: 'Jackson Hole Symposium', type: 'Fed' },
  { date: '2026-09-04', label: 'US Jobs Report (August)', type: 'Jobs' },
  { date: '2026-09-16', label: 'FOMC Rate Decision', type: 'Fed' },
  { date: '2026-10-15', label: 'US CPI (September)', type: 'Inflation' },
  { date: '2026-10-28', label: 'FOMC Rate Decision', type: 'Fed' },
  { date: '2026-12-09', label: 'FOMC Rate Decision', type: 'Fed' },
];

// VIX fear/greed label from its level.
export function vixLabel(vix) {
  if (vix == null) return { label: '—', tone: 'neutral' };
  if (vix < 15) return { label: 'Low volatility', tone: 'calm' };
  if (vix < 20) return { label: 'Moderate', tone: 'neutral' };
  if (vix < 30) return { label: 'High / fear', tone: 'warn' };
  return { label: 'Extreme fear', tone: 'danger' };
}
