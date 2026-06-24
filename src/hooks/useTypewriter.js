import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Progressively reveals `full` character by character. Returns { text, done }.
// If the user prefers reduced motion (or there's no text), the full string is
// shown immediately.
export function useTypewriter(full, speed = 14) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearInterval(timer.current);

    if (!full) {
      setText('');
      setDone(false);
      return;
    }

    if (prefersReducedMotion()) {
      setText(full);
      setDone(true);
      return;
    }

    setText('');
    setDone(false);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timer.current);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer.current);
  }, [full, speed]);

  return { text, done };
}
