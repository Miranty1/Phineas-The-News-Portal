// Client helpers that talk to the /api/ai serverless proxy.
import { isAustralian } from './categories.js';

async function postAI(payload) {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'AI request failed');
  return data;
}

// Returns { briefing, featuredIndex } for the hero section + featured pick.
// Headlines are tagged by region and ordered Australia-first so the briefing can lead
// with Australian markets (and AU stories are never dropped by the server's top-N slice).
export function getBriefingAndFeatured(stories) {
  const headlines = stories
    .map((s) => ({ title: s.title, source: s.source, au: isAustralian(s) }))
    .sort((a, b) => Number(b.au) - Number(a.au));
  return postAI({ mode: 'briefing', headlines });
}

// Returns { summary } — markdown bullet points for a single story.
export function summarise(title, snippet) {
  return postAI({ mode: 'summarise', title, snippet });
}
