'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { defaultContent, defaultFeatures, defaultSteps } from '@/lib/defaults';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage';

const MOTION_TOGGLES = [
  {
    key: 'splash',
    label: 'Startup animation',
    help: 'Show the animated Cropsphere.ai logo when a visitor first opens the site.',
  },
  {
    key: 'progress',
    label: 'Page loading bar',
    help: 'Thin green bar across the top while a new page loads.',
  },
  {
    key: 'skeletons',
    label: 'Content placeholders',
    help: 'Grey placeholder cards while news, team and feature content loads.',
  },
  {
    key: 'spinners',
    label: 'Button spinners',
    help: 'Small spinner inside buttons while saving or uploading.',
  },
  {
    key: 'reveal',
    label: 'Scroll animations',
    help: 'Cards and sections fade in as the visitor scrolls down the page.',
  },
];

// Declared at module scope: defining it inside AdminContent would give it a new
// identity on every render, so React would unmount and remount each button and
// focus would be lost while typing.
function SaveButton({ sectionKey, value, saving, saved, onSave, children }) {
  return (
    <button
      onClick={() => onSave(sectionKey, value)}
      disabled={saving}
      className="btn-primary"
    >
      {saving && <Spinner />}
      {saving ? 'Saving…' : saved ? '✓ Saved' : children}
    </button>
  );
}

export default function AdminContent() {
  const [hero, setHero] = useState(defaultContent.hero);
  const [about, setAbout] = useState(defaultContent.about);
  const [contact, setContact] = useState(defaultContent.contact);
  const [features, setFeatures] = useState(defaultFeatures);
  const [steps, setSteps] = useState(defaultSteps);
  const [motion, setMotion] = useState(defaultContent.motion);
  const [saved, setSaved] = useState('');
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_content').select('key, value');
      for (const row of data ?? []) {
        if (row.key === 'hero') setHero(row.value);
        if (row.key === 'about') setAbout(row.value);
        if (row.key === 'contact') setContact(row.value);
        if (row.key === 'features') setFeatures(row.value);
        if (row.key === 'steps') setSteps(row.value);
        if (row.key === 'motion') {
          setMotion({ ...defaultContent.motion, ...row.value });
        }
      }
    }
    load();
  }, []);

  async function save(key, value) {
    setError('');
    setSaved('');
    // Was missing entirely, so the button stayed live during the write and
    // could be submitted twice.
    setSavingKey(key);
    const { error: err } = await supabase
      .from('site_content')
      .upsert({ key, value });
    setSavingKey(null);
    if (err) setError(err.message);
    else {
      setSaved(key);
      setTimeout(() => setSaved(''), 2000);
    }
  }

  function updateList(list, setList, i, field, val) {
    const copy = [...list];
    copy[i] = { ...copy[i], [field]: val };
    setList(copy);
  }

  // Binds the shared status state so every section reports progress the same way.
  const saveProps = (key) => ({
    sectionKey: key,
    saving: savingKey === key,
    saved: saved === key,
    onSave: save,
  });

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-leaf-900">Site Content</h1>
      <ErrorMessage>{error}</ErrorMessage>
      {/* Kept mounted so the live region exists before its text arrives —
          otherwise screen readers routinely miss the announcement. */}
      <StatusMessage>{saved ? 'Saved' : ''}</StatusMessage>

      {/* Loading & animations */}
      <section className="card space-y-1">
        <h2 className="font-bold text-leaf-900">
          <span aria-hidden="true">🎬</span> Loading &amp; Animations
        </h2>
        <p className="pb-2 text-sm text-gray-500">
          Turn each effect on or off for the public site. Everything still works
          with all of them switched off — the site is just static.
        </p>
        {MOTION_TOGGLES.map((t) => (
          <label
            key={t.key}
            className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition-colors hover:bg-leaf-50"
          >
            <input
              type="checkbox"
              checked={Boolean(motion[t.key])}
              onChange={(e) => setMotion({ ...motion, [t.key]: e.target.checked })}
              className="mt-1 h-4 w-4 shrink-0 accent-leaf-600"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">{t.label}</span>
              <span className="block text-sm text-gray-500">{t.help}</span>
            </span>
          </label>
        ))}
        <div className="pt-2">
          <SaveButton {...saveProps("motion")} value={motion}>
            Save Animation Settings
          </SaveButton>
        </div>
      </section>

      {/* Hero */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900"><span aria-hidden="true">🏠</span> Homepage Hero</h2>
        <div>
          <label className="label">Title</label>
          <input className="input" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Subtitle</label>
          <textarea className="input" rows={3} value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Button text</label>
            <input className="input" value={hero.cta} onChange={(e) => setHero({ ...hero, cta: e.target.value })} />
          </div>
          <div>
            <label className="label">Button link (chatbot URL)</label>
            <input className="input" value={hero.cta_link} onChange={(e) => setHero({ ...hero, cta_link: e.target.value })} />
          </div>
        </div>
        <SaveButton {...saveProps("hero")} value={hero}>
          Save Hero
        </SaveButton>
      </section>

      {/* About */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900"><span aria-hidden="true">ℹ️</span> About Page</h2>
        <div>
          <label className="label">Title</label>
          <input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Body text</label>
          <textarea className="input" rows={6} value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
        </div>
        <SaveButton {...saveProps("about")} value={about}>
          Save About
        </SaveButton>
      </section>

      {/* Features */}
      <section className="card space-y-4">
        <h2 className="font-bold text-leaf-900"><span aria-hidden="true">✨</span> Features</h2>
        {features.map((f, i) => (
          <div key={i} className="border border-leaf-100 rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <div>
                <label className="label">Icon</label>
                <input className="input" value={f.icon} onChange={(e) => updateList(features, setFeatures, i, 'icon', e.target.value)} />
              </div>
              <div>
                <label className="label">Title</label>
                <input className="input" value={f.title} onChange={(e) => updateList(features, setFeatures, i, 'title', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={f.description} onChange={(e) => updateList(features, setFeatures, i, 'description', e.target.value)} />
            </div>
            <button type="button" onClick={() => setFeatures(features.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:underline">
              Remove feature
            </button>
          </div>
        ))}
        <div className="flex gap-3">
          <button type="button" onClick={() => setFeatures([...features, { icon: '🌿', title: '', description: '' }])} className="btn-secondary">
            ＋ Add Feature
          </button>
          <SaveButton {...saveProps("features")} value={features}>
            Save Features
          </SaveButton>
        </div>
      </section>

      {/* Steps */}
      <section className="card space-y-4">
        <h2 className="font-bold text-leaf-900"><span aria-hidden="true">🔢</span> How It Works Steps</h2>
        {steps.map((s, i) => (
          <div key={i} className="border border-leaf-100 rounded-xl p-4 space-y-2">
            <div>
              <label className="label">Step {i + 1} title</label>
              <input className="input" value={s.title} onChange={(e) => updateList(steps, setSteps, i, 'title', e.target.value)} />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input" rows={2} value={s.description} onChange={(e) => updateList(steps, setSteps, i, 'description', e.target.value)} />
            </div>
            <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:underline">
              Remove step
            </button>
          </div>
        ))}
        <div className="flex gap-3">
          <button type="button" onClick={() => setSteps([...steps, { title: '', description: '' }])} className="btn-secondary">
            ＋ Add Step
          </button>
          <SaveButton {...saveProps("steps")} value={steps}>
            Save Steps
          </SaveButton>
        </div>
      </section>

      {/* Contact */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900"><span aria-hidden="true">📞</span> Contact Info</h2>
        <div>
          <label className="label">Email</label>
          <input className="input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Address / Location</label>
          <input className="input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
        </div>
        <SaveButton {...saveProps("contact")} value={contact}>
          Save Contact
        </SaveButton>
      </section>
    </div>
  );
}
