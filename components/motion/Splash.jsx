'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/brand/BrandMark';

/**
 * Branded overlay shown on the first visit of a browser session.
 *
 * Repeat visits are suppressed *before first paint* by the inline script in
 * app/layout.js, which stamps `data-splash-seen` on <html>; the CSS rule below
 * then hides this node without waiting for hydration. Hiding it in an effect
 * instead would flash the overlay on every navigation-back.
 *
 * The fade-out is a CSS animation, so it plays even if hydration is slow. The
 * unmount timer is only a safety net — the overlay must never trap the user.
 */
export default function Splash() {
  const pathname = usePathname();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Safety net only — the CSS fade completes at 2.1s. Nothing may trap the
    // user if animations are disabled at the browser level.
    const t = setTimeout(() => setGone(true), 2600);
    return () => clearTimeout(t);
  }, []);

  // The admin portal is a working tool, not a brand surface.
  if (gone || pathname.startsWith('/admin')) return null;

  return (
    <div
      id="brand-splash"
      aria-hidden="true"
      className="animate-splash-out fixed inset-0 z-[80] flex flex-col items-center justify-center gap-5 bg-cream"
    >
      <BrandMark size={120} variant="grow" />
      <p className="animate-fade-in text-xl font-extrabold tracking-tight text-leaf-700 [animation-delay:800ms]">
        Cropsphere.ai
      </p>
    </div>
  );
}
