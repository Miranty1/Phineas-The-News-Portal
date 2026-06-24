import SourceTag from './SourceTag.jsx';
import Summary from './Summary.jsx';
import { relativeTime } from '../lib/time.js';

// The AI-picked most-significant story, rendered large below the briefing.
export default function FeaturedStory({ story }) {
  if (!story) return null;

  return (
    <article className="group relative animate-riseIn overflow-hidden rounded-xl border border-aipick/40 bg-gradient-to-br from-surface to-surface/30 p-5 shadow-[0_0_50px_-18px_rgba(167,139,250,0.6)] sm:p-6">
      {/* Soft purple wash bleeding in from the top-right corner. */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-aipick/10 blur-3xl" />

      <div className="relative mb-3 flex flex-wrap items-center gap-3">
        <span className="animate-pulseGlow rounded border border-aipick/50 bg-aipick/10 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-widest text-aipick">
          ✦ AI Pick
        </span>
        <SourceTag name={story.source} color={story.sourceColor} />
        <span className="font-mono text-[11px] text-secondary">
          {relativeTime(story.pubDate)}
        </span>
      </div>

      <a
        href={story.link}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block font-mono text-xl font-semibold leading-tight text-primary transition-colors duration-200 group-hover:text-accent sm:text-2xl"
      >
        {story.title}
      </a>

      {story.snippet && (
        <p className="relative mt-3 text-[15px] leading-relaxed text-secondary">
          {story.snippet}
        </p>
      )}

      <div className="relative">
        <Summary title={story.title} snippet={story.snippet} />
      </div>
    </article>
  );
}
