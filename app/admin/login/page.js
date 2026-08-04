'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import { markActivityNow, clearActivity } from '@/lib/useIdleLogout';
import BrandMark from '@/components/brand/BrandMark';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage } from '@/components/ui/StatusMessage';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // null until the password step succeeds on an account with 2FA enrolled.
  const [mfa, setMfa] = useState(null);
  const [code, setCode] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    if (!supabaseConfigured) {
      setError('Supabase is not configured yet. See the README.');
      return;
    }
    setBusy(true);
    setError('');
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setBusy(false);
      return setError(signInErr.message);
    }

    // Signing in *is* activity. Starts the idle window fresh so the countdown
    // never inherits a timestamp from a previous visit to this browser.
    markActivityNow();

    // The password gave us a session, but on an account with TOTP enrolled that
    // session is only aal1. `nextLevel` tells us aal2 is available and still
    // required, which is exactly when the code prompt is owed.
    const { data: aal, error: aalErr } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalErr) {
      setBusy(false);
      return setError(aalErr.message);
    }

    if (aal.nextLevel === 'aal2' && aal.nextLevel !== aal.currentLevel) {
      const { data: list, error: listErr } = await supabase.auth.mfa.listFactors();
      setBusy(false);
      if (listErr) return setError(listErr.message);

      const factor = (list?.totp ?? []).find((f) => f.status === 'verified');
      if (!factor) {
        return setError('Two-factor is required on this account but no verified app is set up.');
      }
      setCode('');
      return setMfa({ factorId: factor.id });
    }

    setBusy(false);
    router.replace('/admin');
  }

  async function handleVerify(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
      factorId: mfa.factorId,
    });
    if (chErr) {
      setBusy(false);
      return setError(chErr.message);
    }

    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: mfa.factorId,
      challengeId: ch.id,
      code: code.trim(),
    });
    if (vErr) {
      setBusy(false);
      setCode('');
      return setError('That code was not accepted. Check the current code in your app.');
    }

    markActivityNow();
    setBusy(false);
    router.replace('/admin');
  }

  // Leaves the half-authenticated aal1 session behind if the user backs out.
  async function cancelMfa() {
    await supabase.auth.signOut();
    clearActivity();
    setMfa(null);
    setCode('');
    setError('');
    setPassword('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {mfa ? (
        <form onSubmit={handleVerify} className="card w-full max-w-sm">
          <div className="flex justify-center">
            <BrandMark size={52} variant="grow" />
          </div>
          <h1 className="mt-2 text-xl font-bold text-center text-leaf-900">
            Two-Factor Verification
          </h1>
          <p className="mt-2 text-center text-sm text-gray-500">
            Enter the 6-digit code from your authenticator app.
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="totp">
                Authentication code
              </label>
              <input
                id="totp"
                className="input text-center font-mono text-xl tracking-[0.4em]"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                required
                autoFocus
              />
            </div>
            <ErrorMessage>{error}</ErrorMessage>
            <button
              type="submit"
              disabled={busy || code.length !== 6}
              className="btn-primary w-full"
            >
              {busy && <Spinner />}
              {busy ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={cancelMfa}
              disabled={busy}
              className="w-full text-sm text-gray-500 transition-colors hover:text-gray-700 hover:underline disabled:opacity-50"
            >
              Back to login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="card w-full max-w-sm">
          <div className="flex justify-center">
            <BrandMark size={52} variant="grow" />
          </div>
          <h1 className="mt-2 text-xl font-bold text-center text-leaf-900">
            Cropsphere.ai Admin Login
          </h1>
          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
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
      )}
    </div>
  );
}
