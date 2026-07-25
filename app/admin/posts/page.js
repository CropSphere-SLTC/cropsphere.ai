'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage } from '@/components/ui/StatusMessage';
import { SkeletonRegion, AdminRowSkeleton } from '@/components/ui/Skeleton';

const empty = { title: '', slug: '', excerpt: '', content: '', cover_url: '', published: false };

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(null); // null = list view
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Without this the list renders "No posts yet" while the fetch is still in
  // flight, inviting the admin to re-create content that already exists.
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  async function load() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const row = { ...form, slug: form.slug || slugify(form.title) };
    const { error: err } = row.id
      ? await supabase.from('posts').update(row).eq('id', row.id)
      : await supabase.from('posts').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    setForm(null);
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this post?')) return;
    setPendingId(id);
    setError('');
    const { error: err } = await supabase.from('posts').delete().eq('id', id);
    if (err) {
      setError(err.message);
      setPendingId(null);
      return;
    }
    await load();
    setPendingId(null);
  }

  async function togglePublish(p) {
    setPendingId(p.id);
    setError('');
    // Flip the pill immediately, roll back if the write fails — the state
    // change is the answer to the click, not the round trip.
    const next = !p.published;
    setPosts((cur) =>
      cur.map((row) => (row.id === p.id ? { ...row, published: next } : row))
    );
    const { error: err } = await supabase
      .from('posts')
      .update({ published: next })
      .eq('id', p.id);
    if (err) {
      setError(err.message);
      setPosts((cur) =>
        cur.map((row) => (row.id === p.id ? { ...row, published: p.published } : row))
      );
    }
    setPendingId(null);
  }

  if (form) {
    return (
      <form onSubmit={save} className="max-w-2xl">
        <h1 className="text-2xl font-bold text-leaf-900">
          {form.id ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="mt-6 card space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Slug (URL) — leave blank to auto-generate</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder={slugify(form.title) || 'my-post'}
            />
          </div>
          <div>
            <label className="label">Excerpt (short summary)</label>
            <textarea
              className="input"
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea
              className="input"
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </div>
          <ImageUpload
            label="Cover image (optional)"
            value={form.cover_url}
            onChange={(url) => setForm({ ...form, cover_url: url })}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Published (visible on the site)
          </label>
          <ErrorMessage>{error}</ErrorMessage>
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary">
              {busy && <Spinner />}
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              disabled={busy}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-900">News & Newsletters</h1>
        <button onClick={() => setForm({ ...empty })} className="btn-primary">
          ＋ New Post
        </button>
      </div>
      <ErrorMessage className="mt-4">{error}</ErrorMessage>

      {loading ? (
        <SkeletonRegion label="Loading posts" className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminRowSkeleton key={i} />
          ))}
        </SkeletonRegion>
      ) : (
        <div className="mt-6 space-y-3">
          {posts.length === 0 && (
            <p className="text-gray-500">No posts yet. Create your first one!</p>
          )}
          {posts.map((p) => (
            <div
              key={p.id}
              aria-busy={pendingId === p.id}
              className={`card flex items-center gap-4 transition-opacity duration-200 ${
                pendingId === p.id ? 'opacity-60' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-leaf-900 truncate">{p.title}</p>
                <p className="text-xs text-gray-400">
                  /news/{p.slug} · {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => togglePublish(p)}
                disabled={pendingId === p.id}
                aria-pressed={p.published}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-200 disabled:opacity-50 ${
                  p.published
                    ? 'bg-leaf-100 text-leaf-700 hover:bg-leaf-200'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {p.published ? 'Published' : 'Draft'}
              </button>
              <button
                onClick={() => setForm(p)}
                disabled={pendingId === p.id}
                className="text-sm font-medium text-leaf-600 transition-colors hover:text-leaf-800 hover:underline disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p.id)}
                disabled={pendingId === p.id}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {pendingId === p.id && <Spinner />}
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
