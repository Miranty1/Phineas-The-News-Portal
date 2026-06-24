// Colour-coded source label. The colour comes from the feed definition so the
// component stays purely presentational.
export default function SourceTag({ name, color }) {
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider"
      style={{
        color,
        backgroundColor: `${color}1a`, // ~10% alpha
        border: `1px solid ${color}40`,
      }}
    >
      {name}
    </span>
  );
}
