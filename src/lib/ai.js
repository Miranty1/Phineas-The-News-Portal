// Client helpers that talk to the /api/ai serverless proxy.

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

// Returns { briefing, featuredIndex, label } for the hero section + featured pick.
export function getBriefingAndFeatured(stories) {
  const headlines = stories.map((s) => ({ title: s.title, source: s.source }));
  return postAI({ mode: 'briefing', headlines });
}

// Returns { summary } — markdown bullet points for a single story.
export function summarise(title, snippet) {
  return postAI({ mode: 'summarise', title, snippet });
}
