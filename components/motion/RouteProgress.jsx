'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Top-of-viewport progress bar for page navigation.
 *
 * The public pages are async server components, so clicking a link currently
 * produces no feedback at all until the new page swaps in. This closes that
 * gap (Nielsen: visibility of system status).
 *
 * Next 14.2.33 has no `useLinkStatus` (15.3+) and the App Router has no
 * `router.events`, so navigation is detected with a capture-phase click
 * listener on `document`. That works for every existing <Link> without
 * touching a single call site.
 *
 * Deliberately NOT wired to `useSearchParams` — in a root-layout client
 * component that opts every static page into dynamic rendering.
 */

const SHOW_DELAY = 120; // under ~100ms reads as instant; a bar there is noise
const MIN_VISIBLE = 320; // once shown, stay long enough to read — no strobe
const HARD_STOP = 8000; // a cancelled navigation must never leave it running

export default function RouteProgress() {
  const pathname = usePathname();
  const [state, setState] = useState('idle'); // 'idle' | 'active' | 'done'
  const stateRef = useRef('idle');
  const showT = useRef(null);
  const hideT = useRef(null);
  const stopT = useRef(null);
  const doneT = useRef(null);
  const shownAt = useRef(0);

  const set = useCallback((s) => {
    stateRef.current = s;
    setState(s);
  }, []);

  const finish = useCallback(() => {
    clearTimeout(showT.current);
    clearTimeout(stopT.current);
    if (stateRef.current === 'idle') return;
    const wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
    hideT.current = setTimeout(() => {
      set('done');
      doneT.current = setTimeout(() => set('idle'), 420);
    }, wait);
  }, [set]);

  const start = useCallback(() => {
    clearTimeout(showT.current);
    clearTimeout(hideT.current);
    clearTimeout(doneT.current);
    showT.current = setTimeout(() => {
      shownAt.current = Date.now();
      set('active');
    }, SHOW_DELAY);
    stopT.current = setTimeout(finish, HARD_STOP);
  }, [finish, set]);

  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target instanceof Element ? e.target.closest('a[href]') : null;
      if (!a || a.hasAttribute('download')) return;
      if (a.target && a.target !== '_self') return;

      let url;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      // Same-page or hash-only link: no navigation happens, so `pathname`
      // would never change and the bar would hang.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      start();
    }

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', start);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', start);
      clearTimeout(showT.current);
      clearTimeout(hideT.current);
      clearTimeout(stopT.current);
      clearTimeout(doneT.current);
    };
  }, [start]);

  // The destination actually rendered.
  useEffect(() => {
    finish();
  }, [pathname, finish]);

  if (state === 'idle') return null;

  // aria-hidden on purpose: the App Router already ships a route announcer
  // that reads document.title after navigation. A live region here would
  // announce every page change twice.
  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <span
        className={
          state === 'done'
            ? 'block h-full w-full origin-left scale-x-100 bg-gradient-to-r from-leaf-700 via-leaf-500 to-grain opacity-0 transition-[transform,opacity] duration-200'
            : 'block h-full w-full origin-left animate-route-bar bg-gradient-to-r from-leaf-700 via-leaf-500 to-grain shadow-[0_0_8px_rgba(61,148,64,.5)]'
        }
      />
    </div>
  );
}
