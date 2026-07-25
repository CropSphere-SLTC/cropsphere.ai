'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Uploads an image to the public "images" storage bucket and returns its URL.
export default function ImageUpload({ value, onChange, label = 'Image' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('images').upload(path, file);
    if (upErr) {
      setError(upErr.message);
    } else {
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setBusy(false);
  }

  return (
    <div>
      <label className="label">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-24 rounded-lg object-cover mb-2" />
      )}
      <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
      {busy && <p className="text-sm text-gray-500">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="block text-xs text-red-500 mt-1 hover:underline"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
