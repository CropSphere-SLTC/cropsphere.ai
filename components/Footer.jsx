'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BrandMark from '@/components/brand/BrandMark';

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="on-dark bg-leaf-900 text-leaf-100 mt-16">
      <div className="container-site py-10 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-extrabold text-lg text-white flex items-center gap-2">
            <BrandMark size={24} /> AgriBot
          </p>
          <p className="mt-2 text-sm text-leaf-200">
            AI-powered farming guidance for the farmers of Sri Lanka. A final year
            project by TCC Group.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Quick Links</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/about" className="link-underline transition-colors hover:text-white">About</Link></li>
            <li><Link href="/features" className="link-underline transition-colors hover:text-white">Features</Link></li>
            <li><Link href="/news" className="link-underline transition-colors hover:text-white">News</Link></li>
            <li><Link href="/team" className="link-underline transition-colors hover:text-white">Our Team</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white mb-2">Contact</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/contact" className="link-underline transition-colors hover:text-white">Get in touch</Link></li>
            <li><Link href="/admin/login" className="link-underline text-leaf-300 transition-colors hover:text-white">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-leaf-800 py-4 text-center text-xs text-leaf-300">
        © {new Date().getFullYear()} AgriBot · TCC Group. All rights reserved.
      </div>
    </footer>
  );
}
