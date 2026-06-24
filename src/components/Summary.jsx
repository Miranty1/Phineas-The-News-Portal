import { useState } from 'react';
import { summarise } from '../lib/ai.js';

// Renders the "✦ Summarise" button plus the inline AI summary it produces.
// Shared by StoryCard and FeaturedStory so the behaviour stays identical.
export default function Summary({ title, snippet }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error
  const [bullets, setBullets] = useState([]);
  const [error, setError] = useState(null);

  async function run() {
    setState('loading');
    setError(null);
    try {
      const { summary } = await summarise(title, snippet);
      const lines = summary
        .split('\n')
        .map((l) => l.replace(/^[-*•]\s*/, '').trim())
        .filter(Boolean);
      setBullets(lines);
      setState('done');
    } catch (err) {
      setError(err.message || 'Summary failed');
      setState('error');
    }
  }

  return (
    <div className="mt-3">
      {state !== 'done' && (
        <button
          onClick={run}
          disabled={state === 'loading'}
          className="inline-flex items-center gap-1 rounded border border-aipick/40 bg-aipick/10 px-2.5 py-1 font-mono text-xs text-aipick transition hover:bg-aipick/20 hover:shadow-[0_0_14px_-3px_rgba(167,139,250,0.7)] disabled:opacity-50"
        >
          <span>✦</span>
          {state === 'loading' ? 'Summarising…' : state === 'error' ? 'Retry' : 'Summarise'}
        </button>
      )}

      {state === 'error' && <p className="mt-2 text-xs text-red-400">{error}</p>}

      {state === 'done' && (
        <div className="mt-1 animate-fadeIn rounded-md border border-aipick/30 bg-aipick/5 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-aipick">
            ✦ AI Summary
          </p>
          <ul className="space-y-1.5">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-primary/90">
                <span className="text-aipick">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
