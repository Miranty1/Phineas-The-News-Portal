import { CATEGORIES } from '../lib/categories.js';

// Horizontal row of category filter chips (single-select). Scrolls on mobile.
export default function CategoryBar({ active, counts, onChange }) {
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => {
        const isActive = active === c.id;
        const count = counts?.[c.id] ?? 0;
        // Hide empty topic chips (but always keep All); Australia/International stay
        // visible so the regions are always selectable.
        if (count === 0 && !['all', 'australia', 'international'].includes(c.id)) {
          return null;
        }
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition ${
              isActive
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border bg-surface/60 text-secondary hover:border-accent/40 hover:text-primary'
            }`}
          >
            {c.label}
            <span className={`text-[10px] ${isActive ? 'text-accent/70' : 'text-secondary/60'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
