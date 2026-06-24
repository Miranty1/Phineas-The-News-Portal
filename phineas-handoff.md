# Phineas — The Finance News Portal
## Handoff Document for Claude Code

---

## Project Overview

Build **Phineas**, a personal finance news dashboard PWA. The app fetches top finance news from RSS feeds, presents them in a dark-mode terminal-style dashboard, and uses the Anthropic API for an AI morning briefing and on-demand article summaries.

This follows the user's established pattern: React + Vite + Vercel, named apps (Paul, Milo, Gus, Trent, Phineas).

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| RSS Parsing | rss2json.com API (free tier, no key required for basic use) |
| AI | Anthropic API (`claude-sonnet-4-6`) |
| Backend/DB | None — purely client-side |

---

## Data Sources

7 RSS feeds via `rss2json.com`:

| Source | RSS Feed URL |
|---|---|
| Reuters Business | `https://feeds.reuters.com/reuters/businessNews` |
| Investopedia | `https://www.investopedia.com/feedbuilder/feed/getfeed/?feedName=rss_headline` |
| MarketWatch | `http://feeds.marketwatch.com/marketwatch/topstories/` |
| Financial Times | `https://www.ft.com/rss/home` |
| CNBC Finance | `https://www.cnbc.com/id/10000664/device/rss/rss.html` |
| Bloomberg Markets | `https://feeds.bloomberg.com/markets/news.rss` |
| WSJ Markets | `https://feeds.a.wsj.com/rss/RSSMarketsMain.xml` |

Fetch via rss2json endpoint:
```
https://api.rss2json.com/v1/api.json?rss_url=ENCODED_FEED_URL&count=5
```

> Note: Some feeds (FT, Bloomberg) may have CORS or access restrictions — verify each feed works through rss2json at build time and swap in alternatives if needed.

---

## App Structure

```
phineas/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App title + refresh button
│   │   ├── AIBriefing.jsx      # Hero AI briefing section
│   │   ├── FeaturedStory.jsx   # AI-picked featured story card (large)
│   │   ├── NewsGrid.jsx        # Grid of story cards
│   │   ├── StoryCard.jsx       # Individual story card
│   │   └── SourceTag.jsx       # Colour-coded source label
│   ├── hooks/
│   │   └── useNewsFeeds.js     # Fetches + aggregates all RSS feeds
│   ├── lib/
│   │   └── anthropic.js        # Anthropic API call helpers
│   ├── App.jsx
│   └── main.jsx
├── .env                        # VITE_ANTHROPIC_API_KEY
├── vite.config.js
└── package.json
```

---

## Page Layout

### 1. Header
- App name: **Phineas** with subtitle "The Finance News Portal"
- Right-aligned: last refreshed timestamp + manual **Refresh** button
- Thin top border accent line (terminal feel)

### 2. AI Briefing (Hero Section)
- Full-width panel at the top
- Heading: "This Morning's Briefing" (or time-appropriate: "Midday Update", "Evening Wrap")
- 3–5 sentence AI-generated market summary
- Subtle animated typing effect or fade-in on load
- Loading skeleton while AI call is in progress

### 3. Featured Story
- Large card below the briefing — AI-picked single most significant story
- Shows: headline (large), source tag, timestamp, full RSS description, link to article
- Small label: "✦ AI Pick" in accent colour
- Includes the **AI Summary** button (same as grid cards)

### 4. News Grid
- Responsive CSS grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- All remaining stories from all 7 feeds, sorted by recency
- Each **StoryCard** shows:
  - Headline (linked to article, opens in new tab)
  - Source tag (colour-coded per source)
  - Relative timestamp ("2 hours ago")
  - Raw RSS snippet (1–2 sentences)
  - **✦ Summarise** button

---

## AI Integration

### Single load-time API call (briefing + featured pick)

```javascript
// lib/anthropic.js
export async function getBriefingAndFeatured(stories) {
  const headlines = stories
    .slice(0, 20)
    .map((s, i) => `${i + 1}. [${s.source}] ${s.title}`)
    .join('\n');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a finance analyst. Given these top headlines, do two things:
1. Write a 3-5 sentence market briefing summarising the key themes and mood across these stories.
2. Pick the single most significant story and return its number.

Headlines:
${headlines}

Respond ONLY in this JSON format (no markdown, no preamble):
{
  "briefing": "...",
  "featuredIndex": 2
}`
      }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;
  return JSON.parse(text);
}
```

### On-demand article summary (per card)

```javascript
export async function summariseArticle(title, snippet) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Summarise this finance news article in 3-4 bullet points covering the key facts and implications for investors. Be concise and specific.

Title: ${title}
Snippet: ${snippet}

Respond in plain bullet points only, no preamble.`
      }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}
```

---

## Fetch Strategy

- Fetch all 7 RSS feeds in parallel on page load (`Promise.allSettled`)
- Failed feeds are silently skipped (don't break the app)
- Manual refresh button re-runs the full fetch + AI briefing cycle
- No caching, no auto-refresh interval — user-driven

```javascript
// hooks/useNewsFeeds.js
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

export async function fetchFeed(source) {
  const url = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(source.url)}&count=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items.map(item => ({
    ...item,
    source: source.name,
    sourceColor: source.color,
  }));
}
```

---

## Visual Design

**Theme:** Dark mode terminal — Bloomberg meets personal dashboard

| Token | Value |
|---|---|
| Background | `#0a0e17` (deep navy-black) |
| Surface/cards | `#111827` |
| Border | `#1f2937` |
| Primary text | `#f9fafb` |
| Secondary text | `#9ca3af` |
| Accent | `#22d3ee` (cyan — terminal feel) |
| AI Pick accent | `#a78bfa` (purple) |

**Source tag colours:**
| Source | Colour |
|---|---|
| Reuters | `#f97316` (orange) |
| Investopedia | `#22c55e` (green) |
| MarketWatch | `#3b82f6` (blue) |
| FT | `#f59e0b` (amber) |
| CNBC | `#ef4444` (red) |
| Bloomberg | `#8b5cf6` (purple) |
| WSJ | `#ec4899` (pink) |

**Typography:** Monospace or semi-mono feel — `JetBrains Mono` or `IBM Plex Mono` for headings, `Inter` for body.

---

## Environment Variables

```env
VITE_ANTHROPIC_API_KEY=your_key_here
```

> ⚠️ This exposes the API key client-side. Acceptable for a personal-use tool. Do not deploy publicly without moving to a serverless proxy.

---

## Suggested Skills to Invoke

- `frontend-design` — for visual polish and dark theme implementation
- `impeccable` — for UI audit and component refinement
- `emil-design-eng` — for micro-interactions and animation details

---

## Out of Scope (for now)

- User authentication
- Saved/bookmarked stories
- Category filtering (Markets, Macro, Equities)
- Push notifications
- Mobile app (PWA shell can be added later)
- Backend proxy for API key protection
