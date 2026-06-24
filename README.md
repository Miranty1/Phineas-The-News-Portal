# Phineas — The Finance News Portal

A dark, terminal-style finance news dashboard. Aggregates 7 finance RSS feeds and uses
Google Gemini for a market briefing, an AI-picked featured story, and on-demand
per-article summaries. React + Vite frontend, Vercel serverless backend. Runs at £0.

## How it works

```
React + Vite + Tailwind  ──►  /api/news  → fetch + parse 7 RSS feeds (server-side)
   (dark UI)             ──►  /api/ai    → proxy to Gemini (briefing | summarise)
```

The Gemini API key lives **server-side only** in the Vercel functions — it is never
shipped to the browser.

## Setup

1. **Get a free Gemini API key** at <https://aistudio.google.com/apikey>.
2. Copy the env template and add your key:
   ```bash
   cp .env.example .env
   # edit .env and set GEMINI_API_KEY=...
   ```
3. Install deps:
   ```bash
   npm install
   ```

## Running locally

The `/api` routes are Vercel serverless functions, so use the Vercel CLI to run the
frontend and the functions together:

```bash
npm i -g vercel        # once
vercel dev             # serves the app + /api/news + /api/ai
```

> Plain `npm run dev` (Vite only) serves the UI but **not** the `/api` routes — use
> `vercel dev` for the full app.

## Deploying

```bash
vercel               # first deploy / link the project
```

Then in the Vercel dashboard add the **`GEMINI_API_KEY`** environment variable.
Once deployed, open the URL in Safari on your phone and "Add to Home Screen".

## Feeds

Sources live in `api/_sources.js`. Publishers change their RSS URLs often — if a feed
stops returning items, swap in a working equivalent there. Failed feeds are skipped
silently and never break the app.
