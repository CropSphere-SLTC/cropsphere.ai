'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeImageUrl } from '@/lib/safeUrl';
import ImageUpload from '@/components/ImageUpload';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage } from '@/components/ui/StatusMessage';
import { SkeletonRegion, AdminRowSkeleton } from '@/components/ui/Skeleton';

const empty = { name: '', role: '', bio: '', photo_url: '', sort_order: 0, category: 'member' };

export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);

  async function load() {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });
    setTeam(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    // Explicit column list rather than spreading `form`: client state can then
    // never introduce a column the table did not expect.
    const row = {
      name: form.name,
      role: form.role,
      bio: form.bio,
      photo_url: form.photo_url,
      category: form.category,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error: err } = form.id
      ? await supabase.from('team_members').update(row).eq('id', form.id)
      : await supabase.from('team_members').insert(row);
    setBusy(false);
    if (err) return setError(err.message);
    setForm(null);
    load();
  }

  async function remove(id) {
    if (!confirm('Remove this team member?')) return;
    setPendingId(id);
    setError('');
    const { error: err } = await supabase.from('team_members').delete().eq('id', id);
    if (err) {
      setError(err.message);
      setPendingId(null);
      return;
    }
    await load();
    setPendingId(null);
  }

  if (form) {
    return (
      <form onSubmit={save} className="max-w-xl">
        <h1 className="text-2xl font-bold text-leaf-900">
          {form.category === 'supervisor'
            ? form.id
              ? 'Edit Supervisor'
              : 'Add Supervisor'
            : form.id
              ? 'Edit Member'
              : 'Add Team Member'}
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
            <label className="label" htmlFor="member-category">
              Category
            </label>
            <select
              id="member-category"
              className="input"
              value={form.category ?? 'member'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="member">Team Member</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <div>
            <label className="label">Display order (lower = first)</label>
            <input
              type="number"
              className="input"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </div>
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
        <h1 className="text-2xl font-bold text-leaf-900">Team</h1>
        <button onClick={() => setForm({ ...empty })} className="btn-primary">
          ＋ Add Member
        </button>
      </div>
      <ErrorMessage className="mt-4">{error}</ErrorMessage>

      {loading ? (
        <SkeletonRegion label="Loading team members" className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <AdminRowSkeleton key={i} avatar />
          ))}
        </SkeletonRegion>
      ) : (
        <div className="mt-6 space-y-3">
          {team.length === 0 && <p className="text-gray-500">No team members yet.</p>}
          {team.map((m) => (
            <div
              key={m.id}
              aria-busy={pendingId === m.id}
              className={`card flex items-center gap-4 transition-opacity duration-200 ${
                pendingId === m.id ? 'opacity-60' : ''
              }`}
            >
              {safeImageUrl(m.photo_url) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={safeImageUrl(m.photo_url)} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div
                  className="w-12 h-12 rounded-full bg-leaf-100 flex items-center justify-center"
                  aria-hidden="true"
                >
                  👤
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2 font-semibold text-leaf-900">
                  <span className="truncate">{m.name}</span>
                  {m.category === 'supervisor' && (
                    <span className="shrink-0 rounded-full bg-leaf-100 px-2 py-0.5 text-xs font-medium text-leaf-700">
                      Supervisor
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{m.role}</p>
              </div>
              <button
                onClick={() => setForm(m)}
                disabled={pendingId === m.id}
                className="text-sm font-medium text-leaf-600 transition-colors hover:text-leaf-800 hover:underline disabled:opacity-50"
              >
                Edit
              </button>
              <button
                onClick={() => remove(m.id)}
                disabled={pendingId === m.id}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
              >
                {pendingId === m.id && <Spinner />}
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
