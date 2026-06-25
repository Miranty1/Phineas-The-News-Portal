// Category chips for filtering the news grid (single-select lens). Categories
// overlap by design — a story can be both "Australia" and "Stocks".
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'australia', label: 'Australia' },
  { id: 'international', label: 'International' },
  { id: 'markets', label: 'Markets' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'economy', label: 'Economy' },
  { id: 'crypto', label: 'Crypto' },
];

const AU_RE =
  /\b(austral(ia|ian)|asx|rba|aud|reserve bank|sydney|melbourne|canberra|brisbane|perth|adelaide|bhp|rio tinto|cba|westpac|nab|anz|macquarie|qantas|woolworths|telstra|fortescue|wesfarmers|superannuation)\b|a\$/i;

const TOPIC_RE = {
  markets: /\b(market|index|asx|s&p|dow|nasdaq|ftse|share|shares|rally|sell-?off|bond|bonds|yield|yields|wall street)\b/i,
  stocks: /\b(stock|stocks|shares?|equit\w*|earnings|ipo|dividend|ticker)\b/i,
  economy: /\b(inflation|gdp|interest rate|rate cut|rate hike|rate rise|recession|unemployment|central bank|fed|rba|economy|economic)\b/i,
  crypto: /\b(crypto\w*|bitcoin|btc|ethereum|eth|blockchain|stablecoin)\b/i,
};

function haystack(story) {
  return `${story.title || ''} ${story.snippet || ''}`;
}

// A story is Australian-relevant if it came from an AU source or mentions AU terms.
export function isAustralian(story) {
  return story.sourceAU === true || AU_RE.test(haystack(story));
}

// Does a story belong to the given category id?
export function matchesCategory(story, id) {
  if (id === 'all') return true;
  if (id === 'australia') return isAustralian(story);
  if (id === 'international') return !isAustralian(story);
  const re = TOPIC_RE[id];
  return re ? re.test(haystack(story)) : true;
}

// Count how many of `stories` fall in each category, for the chip badges.
export function categoryCounts(stories) {
  const counts = {};
  for (const c of CATEGORIES) {
    counts[c.id] = stories.filter((s) => matchesCategory(s, c.id)).length;
  }
  return counts;
}
