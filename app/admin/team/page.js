'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const empty = { name: '', role: '', bio: '', photo_url: '', sort_order: 0 };

export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    setTeam(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const row = { ...form, sort_order: Number(form.sort_order) || 0 };
    const { error: err } = row.id
      ? await supabase.from('team_members').update(row).eq('id', row.id)
      : await supabase.from('team_members').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    setForm(null);
    load();
  }

  async function remove(id) {
    if (!confirm('Remove this team member?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    load();
  }

  if (form) {
    return (
      <form onSubmit={save} className="max-w-xl">
        <h1 className="text-2xl font-bold text-leaf-900">
          {form.id ? 'Edit Member' : 'Add Team Member'}
        </h1>
        <div className="mt-6 card space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. AI Developer"
            />
          </div>
          <div>
            <label className="label">Short bio</label>
            <textarea
              className="input"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <ImageUpload
            label="Photo"
            value={form.photo_url}
            onChange={(url) => setForm({ ...form, photo_url: url })}
          />
          <div>
            <label className="label">Display order (lower = first)</label>
            <input
              type="number"
              className="input"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
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
        <h1 className="text-2xl font-bold text-leaf-900">Team</h1>
        <button onClick={() => setForm({ ...empty })} className="btn-primary">
          ＋ Add Member
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {team.length === 0 && <p className="text-gray-500">No team members yet.</p>}
        {team.map((m) => (
          <div key={m.id} className="card flex items-center gap-4">
            {m.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.photo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-leaf-100 flex items-center justify-center">👤</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-leaf-900">{m.name}</p>
              <p className="text-sm text-gray-500">{m.role}</p>
            </div>
            <button onClick={() => setForm(m)} className="text-sm text-leaf-600 font-medium hover:underline">
              Edit
            </button>
            <button onClick={() => remove(m.id)} className="text-sm text-red-500 font-medium hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
