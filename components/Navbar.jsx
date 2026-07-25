'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  // Hide public navbar inside the admin portal
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-leaf-100">
      <nav className="container-site flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-leaf-700">
          <span className="text-2xl">🌱</span> AgriBot
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`text-sm font-medium hover:text-leaf-600 transition-colors ${
                  pathname === l.href ? 'text-leaf-600' : 'text-gray-600'
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden p-2 text-leaf-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <ul className="md:hidden bg-white border-t border-leaf-100 px-4 py-2">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-gray-700 font-medium hover:text-leaf-600"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
