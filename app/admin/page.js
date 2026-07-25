'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { SkeletonRegion, StatCardSkeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, published: 0, team: 0 });
  // Without this the cards render a literal "0" while the counts are still in
  // flight — a plausible but false number, which is worse than no number.
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    async function load() {
      const [{ count: posts }, { count: published }, { count: team }] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('team_members').select('*', { count: 'exact', head: true }),
      ]);
      setStats({ posts: posts ?? 0, published: published ?? 0, team: team ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total Posts', value: stats.posts, href: '/admin/posts', icon: '📰' },
    { label: 'Published', value: stats.published, href: '/admin/posts', icon: '✅' },
    { label: 'Team Members', value: stats.team, href: '/admin/team', icon: '👥' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-leaf-900">Dashboard</h1>
      <p className="mt-1 text-gray-500">Welcome back. Manage your site content below.</p>
      {loading ? (
        <SkeletonRegion
          label="Loading dashboard statistics"
          className="mt-8 grid gap-5 sm:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </SkeletonRegion>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="card-link animate-fade-up block">
              <p className="text-3xl" aria-hidden="true">{c.icon}</p>
              <p className="mt-2 text-3xl font-extrabold text-leaf-800">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="mt-8 card">
        <h2 className="font-bold text-leaf-900">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link href="/admin/posts" className="btn-primary">＋ New Post</Link>
          <Link href="/admin/team" className="btn-secondary">Manage Team</Link>
          <Link href="/admin/content" className="btn-secondary">Edit Site Content</Link>
        </div>
      </div>
    </div>
  );
}
