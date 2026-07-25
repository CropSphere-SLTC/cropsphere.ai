'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/brand/BrandMark';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/news', label: 'News' },
  { href: '/team', label: 'Our Team' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [introMark, setIntroMark] = useState(false);
  const toggleRef = useRef(null);
  const pathname = usePathname();

  // Grow the sprout once per session. Teaches the logo→loader connection, so
  // the loading indicator is already a familiar object when it first appears —
  // without the LCP cost of a blocking splash.
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('ab:mark')) {
        sessionStorage.setItem('ab:mark', '1');
        setIntroMark(true);
      }
    } catch {
      /* private mode — just show the static mark */
    }
  }, []);

  // Shadow + tighter background once the page has moved: tells the visitor
  // where they are in the document.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Navigating away should never leave the panel open behind the new page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Hide public navbar inside the admin portal
  if (pathname.startsWith('/admin')) return null;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur transition-[background-color,box-shadow] duration-300 ease-out-expo ${
        scrolled
          ? 'bg-white/95 shadow-sm border-b border-leaf-100'
          : 'bg-white/90 border-b border-leaf-100'
      }`}
    >
      <nav className="container-site flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl text-leaf-700"
        >
          <BrandMark size={30} variant={introMark ? 'grow' : 'static'} />
          AgriBot
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={pathname === l.href ? 'page' : undefined}
                className={`link-underline text-sm font-medium transition-colors hover:text-leaf-600 ${
                  pathname === l.href ? 'text-leaf-600' : 'text-gray-600'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          ref={toggleRef}
          className="md:hidden p-2 text-leaf-700 rounded-lg transition-colors hover:bg-leaf-50"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {/* The bars rotate into the X rather than swapping, so the two states
              read as the same object changing (Gestalt: common fate). */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line
              x1="4"
              y1="7"
              x2="20"
              y2="7"
              className="origin-center transition-transform duration-300 ease-out-expo"
              style={open ? { transform: 'translateY(5px) rotate(45deg)' } : undefined}
            />
            <line
              x1="4"
              y1="12"
              x2="20"
              y2="12"
              className={`origin-center transition-opacity duration-200 ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <line
              x1="4"
              y1="17"
              x2="20"
              y2="17"
              className="origin-center transition-transform duration-300 ease-out-expo"
              style={open ? { transform: 'translateY(-5px) rotate(-45deg)' } : undefined}
            />
          </svg>
        </button>
      </nav>

      {/* grid-template-rows 0fr→1fr gives a real enter AND exit animation with
          no library. `min-h-0` on the child is mandatory or 0fr will not
          collapse. `visibility` interpolates discretely — it flips to hidden
          only at the end, so the close animation plays in full before the
          links leave the tab order (and the a11y tree, which is why no
          aria-hidden is needed here). */}
      <div
        id="mobile-menu"
        className={`md:hidden grid overflow-hidden bg-white transition-[grid-template-rows,opacity,visibility] duration-300 ease-out-expo ${
          open
            ? 'grid-rows-[1fr] opacity-100 visible border-t border-leaf-100'
            : 'grid-rows-[0fr] opacity-0 invisible'
        }`}
      >
        <ul className="min-h-0 overflow-hidden px-4">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={pathname === l.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`block py-2.5 font-medium transition-colors hover:text-leaf-600 ${
                  pathname === l.href ? 'text-leaf-600' : 'text-gray-700'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
