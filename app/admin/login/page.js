'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import BrandMark from '@/components/brand/BrandMark';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage } from '@/components/ui/StatusMessage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setError('Supabase is not configured yet. See the README.');
      return;
    }
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message);
    else router.replace('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="card w-full max-w-sm">
        <div className="flex justify-center">
          <BrandMark size={52} variant="grow" />
        </div>
        <h1 className="mt-2 text-xl font-bold text-center text-leaf-900">
          AgriBot Admin Login
        </h1>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <ErrorMessage>{error}</ErrorMessage>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy && <Spinner />}
            {busy ? 'Logging in…' : 'Log in'}
          </button>
        </div>
      </form>
    </div>
  );
}
