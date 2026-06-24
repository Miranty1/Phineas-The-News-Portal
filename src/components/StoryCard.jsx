import SourceTag from './SourceTag.jsx';
import Summary from './Summary.jsx';
import { relativeTime } from '../lib/time.js';

export default function StoryCard({ story }) {
  return (
    <article className="group flex h-full flex-col rounded-lg border border-border bg-surface p-4 transition duration-300 ease-out hover:-translate-y-1 hover:border-accent/50 hover:bg-surface/90 hover:shadow-[0_8px_30px_-12px_rgba(34,211,238,0.45)]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <SourceTag name={story.source} color={story.sourceColor} />
        <span className="font-mono text-[11px] text-secondary">
          {relativeTime(story.pubDate)}
        </span>
      </div>

      <a
        href={story.link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-[15px] font-medium leading-snug text-primary transition-colors duration-200 group-hover:text-accent"
      >
        {story.title}
      </a>

      {story.snippet && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-secondary">
          {story.snippet}
        </p>
      )}

      <div className="mt-auto">
        <Summary title={story.title} snippet={story.snippet} />
      </div>
    </article>
  );
}
