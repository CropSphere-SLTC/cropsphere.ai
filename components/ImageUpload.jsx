'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { safeImageUrl } from '@/lib/safeUrl';
import { validateImageFile, uploadPath } from '@/lib/imageFile';
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

    // Type, size and magic-byte checks — see lib/imageFile.js for why each one
    // is needed given the bucket is publicly readable.
    const problem = await validateImageFile(file);
    if (problem) {
      setError(problem);
      setBusy(false);
      // Let the same file be re-picked after a fix, which otherwise fires no
      // change event the second time.
      e.target.value = '';
      return;
    }

    const path = uploadPath(file);
    const { error: upErr } = await supabase.storage
      .from('images')
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });
    if (upErr) {
      setError(upErr.message);
    } else {
      const { data } = supabase.storage.from('images').getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setBusy(false);
    e.target.value = '';
  }

  return (
    <div aria-busy={busy}>
      <label className="label">{label}</label>
      {safeImageUrl(value) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={value}
          src={safeImageUrl(value)}
          alt=""
          className="animate-scale-in h-24 rounded-lg object-cover mb-2"
        />
      )}
      <input
        type="file"
        // A picker hint only — validateImageFile is the actual gate.
        accept="image/jpeg,image/png,image/webp,image/avif"
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
