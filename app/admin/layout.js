'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, supabaseConfigured } from '@/lib/supabase';

const nav = [
  { href: '/admin', label: '📊 Dashboard' },
  { href: '/admin/posts', label: '📰 News & Newsletters' },
  { href: '/admin/team', label: '👥 Team' },
  { href: '/admin/content', label: '📝 Site Content' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  if (!session) return null;

  async function logout() {
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-leaf-50 flex">
      <aside className="w-64 bg-leaf-900 text-leaf-100 flex flex-col shrink-0">
        <div className="p-5 font-extrabold text-white text-lg border-b border-leaf-800">
          🌱 AgriBot Admin
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === n.href ? 'bg-leaf-700 text-white' : 'hover:bg-leaf-800'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-leaf-800 space-y-1">
          <Link href="/" className="block px-3 py-2 rounded-lg text-sm hover:bg-leaf-800">
            🌐 View Site
          </Link>
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-leaf-800"
          >
            🚪 Log out
          </button>
        </div>
      </aside>
      <div className="flex-1 p-6 sm:p-10 overflow-x-auto">{children}</div>
    </div>
  );
}
