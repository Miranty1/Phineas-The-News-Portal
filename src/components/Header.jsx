import { NavLink } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';

const navLinkClass = ({ isActive }) =>
  [
    'font-mono text-xs uppercase tracking-widest transition',
    isActive ? 'text-accent' : 'text-secondary hover:text-primary',
  ].join(' ');

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
      {/* Thin terminal accent line that draws itself in on load. */}
      <div className="h-0.5 w-full origin-left animate-drawLine bg-gradient-to-r from-accent via-aipick to-transparent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="group" aria-label="Phineas home">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-primary">
              Phineas
              <span className="cursor-blink !bg-accent" aria-hidden="true" />
            </h1>
          </NavLink>

          <nav className="flex items-center gap-5">
            {/* `end` so "/" isn't marked active on /stock/* and /outlook. */}
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/outlook" className={navLinkClass}>
              Outlook
            </NavLink>
          </nav>
        </div>

        <SearchBar />
      </div>
    </header>
  );
}
