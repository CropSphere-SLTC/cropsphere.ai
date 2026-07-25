'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { defaultContent, defaultFeatures, defaultSteps } from '@/lib/defaults';

export default function AdminContent() {
  const [hero, setHero] = useState(defaultContent.hero);
  const [about, setAbout] = useState(defaultContent.about);
  const [contact, setContact] = useState(defaultContent.contact);
  const [features, setFeatures] = useState(defaultFeatures);
  const [steps, setSteps] = useState(defaultSteps);
  const [saved, setSaved] = useState('');
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
      }
    }
    load();
  }, []);

  async function save(key, value) {
    setError('');
    setSaved('');
    const { error: err } = await supabase
      .from('site_content')
      .upsert({ key, value });
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

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-leaf-900">Site Content</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Hero */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900">🏠 Homepage Hero</h2>
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
        <button onClick={() => save('hero', hero)} className="btn-primary">
          {saved === 'hero' ? '✓ Saved' : 'Save Hero'}
        </button>
      </section>

      {/* About */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900">ℹ️ About Page</h2>
        <div>
          <label className="label">Title</label>
          <input className="input" value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Body text</label>
          <textarea className="input" rows={6} value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
        </div>
        <button onClick={() => save('about', about)} className="btn-primary">
          {saved === 'about' ? '✓ Saved' : 'Save About'}
        </button>
      </section>

      {/* Features */}
      <section className="card space-y-4">
        <h2 className="font-bold text-leaf-900">✨ Features</h2>
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
          <button onClick={() => save('features', features)} className="btn-primary">
            {saved === 'features' ? '✓ Saved' : 'Save Features'}
          </button>
        </div>
      </section>

      {/* Steps */}
      <section className="card space-y-4">
        <h2 className="font-bold text-leaf-900">🔢 How It Works Steps</h2>
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
          <button onClick={() => save('steps', steps)} className="btn-primary">
            {saved === 'steps' ? '✓ Saved' : 'Save Steps'}
          </button>
        </div>
      </section>

      {/* Contact */}
      <section className="card space-y-3">
        <h2 className="font-bold text-leaf-900">📞 Contact Info</h2>
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
        <button onClick={() => save('contact', contact)} className="btn-primary">
          {saved === 'contact' ? '✓ Saved' : 'Save Contact'}
        </button>
      </section>
    </div>
  );
}
