'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const empty = { title: '', slug: '', excerpt: '', content: '', cover_url: '', published: false };

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(null); // null = list view
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data ?? []);
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
    await supabase.from('posts').delete().eq('id', id);
    load();
  }

  async function togglePublish(p) {
    await supabase.from('posts').update({ published: !p.published }).eq('id', p.id);
    load();
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
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="btn-primary disabled:opacity-50">
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setForm(null)} className="btn-secondary">
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
      <div className="mt-6 space-y-3">
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet. Create your first one!</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="card flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-leaf-900 truncate">{p.title}</p>
              <p className="text-xs text-gray-400">
                /news/{p.slug} · {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => togglePublish(p)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                p.published
                  ? 'bg-leaf-100 text-leaf-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.published ? 'Published' : 'Draft'}
            </button>
            <button onClick={() => setForm(p)} className="text-sm text-leaf-600 font-medium hover:underline">
              Edit
            </button>
            <button onClick={() => remove(p.id)} className="text-sm text-red-500 font-medium hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
