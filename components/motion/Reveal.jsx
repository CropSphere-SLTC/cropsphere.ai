'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fades content up as it scrolls into view, once.
 *
 * Content is VISIBLE by default. The hidden state lives in a CSS rule scoped
 * to `html.js`, a class added by an inline script in app/layout.js before
 * first paint — so:
 *   - crawlers and no-JS visitors get fully visible server-rendered HTML,
 *   - with JS the hide is applied before paint, so there is no flash either.
 *
 * See globals.css for the two further safety nets (a 4s CSS failsafe and the
 * prefers-reduced-motion override).
 *
 * Only this wrapper is a client component — children stay server-rendered.
 */
export default function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  delay = 0,
  amount = 0.15,
  ...rest
}) {
  const ref = useRef(null);
  // Matches the server render, so there is no hydration mismatch.
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disabled = document.documentElement.dataset.reveal === 'off';

    if (reduce || disabled || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      // Fire slightly before the element is fully in view so the animation
      // finishes as it settles rather than starting late.
      { threshold: amount, rootMargin: '0px 0px -8% 0px' }
    );
    io.observe(el);

    // Nothing stays hidden, ever.
    const t = setTimeout(() => setShown(true), 2500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [amount]);

  return (
    <Tag
      ref={ref}
      data-reveal={shown ? 'shown' : ''}
      // A custom property, not `delay-[Npx]` — Tailwind's JIT scans source as
      // static text and would never generate a class built from a variable.
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}
