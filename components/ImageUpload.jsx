'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage';

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
    <div aria-busy={busy}>
      <label className="label">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={value}
          src={value}
          alt=""
          className="animate-scale-in h-24 rounded-lg object-cover mb-2"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        // Was enabled during upload, so a second file could be picked mid-flight.
        disabled={busy}
        className="text-sm disabled:cursor-not-allowed disabled:opacity-50"
      />
      <StatusMessage className="mt-1 flex items-center gap-2 text-gray-500">
        {busy ? (
          <>
            <Spinner /> Uploading…
          </>
        ) : null}
      </StatusMessage>
      <ErrorMessage className="mt-1">{error}</ErrorMessage>
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={busy}
          className="mt-1 block text-xs text-red-500 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
        >
          Remove image
        </button>
      )}
    </div>
  );
}
