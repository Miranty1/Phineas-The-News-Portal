import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Ticker lookup in the shell header. Type a symbol, press Enter -> /stock/SYMBOL.
export default function SearchBar() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const symbol = value.trim().toUpperCase();
    if (!symbol) return;
    navigate(`/stock/${encodeURIComponent(symbol)}`);
    setValue('');
  };

  return (
    <form onSubmit={submit} className="relative" role="search">
      <span
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-secondary"
        aria-hidden="true"
      >
        ⌕
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search ticker"
        aria-label="Search ticker symbol"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck="false"
        className="w-32 rounded border border-border bg-surface py-1.5 pl-7 pr-2 font-mono text-xs uppercase text-primary placeholder:normal-case placeholder:text-secondary transition focus:w-40 focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 sm:w-40 sm:focus:w-52"
      />
    </form>
  );
}
