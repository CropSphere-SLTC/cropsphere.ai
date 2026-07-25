'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import BrandMark from '@/components/brand/BrandMark';
import BrandLoader from '@/components/brand/BrandLoader';
import Spinner from '@/components/motion/Spinner';

const nav = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/posts', icon: '📰', label: 'News & Newsletters' },
  { href: '/admin/team', icon: '👥', label: 'Team' },
  { href: '/admin/content', icon: '📝', label: 'Site Content' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (!data.session && !isLogin) router.replace('/admin/login');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [isLogin, router]);

  if (isLogin) return <div className="min-h-screen bg-leaf-50">{children}</div>;

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-leaf-50 flex items-center justify-center p-6">
        <div className="card max-w-lg text-center">
          <h1 className="text-xl font-bold text-leaf-900">Supabase not configured</h1>
          <p className="mt-3 text-gray-600">
            To use the admin portal, create a free Supabase project, run{' '}
            <code className="bg-leaf-50 px-1 rounded">supabase/schema.sql</code>, and add
            your keys to <code className="bg-leaf-50 px-1 rounded">.env.local</code>. See
            the README for step-by-step instructions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader size={96} label="Checking your session…" />
      </div>
    );
  }

  if (!session) return null;

  async function logout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-leaf-50 flex">
      <aside className="on-dark w-64 bg-leaf-900 text-leaf-100 flex flex-col shrink-0">
        <div className="flex items-center gap-2 p-5 font-extrabold text-white text-lg border-b border-leaf-800">
          <BrandMark size={26} /> Cropsphere.ai Admin
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={pathname === n.href ? 'page' : undefined}
              className={`relative block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                pathname === n.href
                  ? 'bg-leaf-700 text-white'
                  : 'hover:bg-leaf-800'
              }`}
            >
              {/* Active marker in addition to colour (WCAG 1.4.1). */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-grain transition-transform duration-200 ease-out-expo ${
                  pathname === n.href ? 'scale-y-100' : 'scale-y-0'
                }`}
              />
              <span aria-hidden="true">{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-leaf-800 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded-lg text-sm transition-colors hover:bg-leaf-800">
            <span aria-hidden="true">🌐</span> View Site
          </Link>
          <button
            onClick={logout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-leaf-800 disabled:opacity-60"
          >
            {loggingOut ? <Spinner /> : <span aria-hidden="true">🚪</span>}
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </aside>
      <div className="flex-1 p-6 sm:p-10 overflow-x-auto">{children}</div>
    </div>
  );
}
