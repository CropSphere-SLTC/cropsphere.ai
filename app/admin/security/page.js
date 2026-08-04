'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { IDLE_LIMIT_MS } from '@/lib/useIdleLogout';
import Spinner from '@/components/motion/Spinner';
import { ErrorMessage, StatusMessage } from '@/components/ui/StatusMessage';

// A password alone protects every piece of content on the public site. TOTP
// adds a second factor that a leaked or reused password cannot defeat.
export default function AdminSecurity() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  // Set while enrolling: { id, qr, secret }
  const [enrolling, setEnrolling] = useState(null);
  const [code, setCode] = useState('');

  const refresh = useCallback(async () => {
    const { data, error: err } = await supabase.auth.mfa.listFactors();
    if (err) setError(err.message);
    // Only fully verified factors count; an abandoned enrolment leaves an
    // unverified one behind that would otherwise look like working 2FA.
    else setFactors(data?.totp ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function startEnrol() {
    setBusy(true);
    setError('');
    setStatus('');
    // Supabase rejects a duplicate friendly name, so keep it unique.
    const { data, error: err } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Authenticator ${new Date().toISOString().slice(0, 16)}`,
    });
    setBusy(false);
    if (err) return setError(err.message);
    setCode('');
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirmEnrol(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({
      factorId: enrolling.id,
    });
    if (chErr) {
      setBusy(false);
      return setError(chErr.message);
    }

    const { error: vErr } = await supabase.auth.mfa.verify({
      factorId: enrolling.id,
      challengeId: ch.id,
      code: code.trim(),
    });
    setBusy(false);
    if (vErr) return setError(`${vErr.message} — check your device's clock is correct.`);

    setEnrolling(null);
    setCode('');
    setStatus('Two-factor authentication is now on. You will be asked for a code next time you log in.');
    refresh();
  }

  async function cancelEnrol() {
    // Remove the half-finished factor rather than leaving it listed.
    if (enrolling) await supabase.auth.mfa.unenroll({ factorId: enrolling.id });
    setEnrolling(null);
    setCode('');
    setError('');
    refresh();
  }

  async function remove(factorId) {
    if (
      !confirm(
        'Turn off two-factor authentication?\n\nYour account will be protected by its password alone.'
      )
    ) {
      return;
    }
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (err) return setError(err.message);
    setStatus('Two-factor authentication has been turned off.');
    refresh();
  }

  const verified = factors.filter((f) => f.status === 'verified');

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-leaf-900">Security</h1>

      <ErrorMessage>{error}</ErrorMessage>
      <StatusMessage>{status}</StatusMessage>

      <section className="card space-y-4">
        <div>
          <h2 className="font-bold text-leaf-900">
            <span aria-hidden="true">🔐</span> Two-Factor Authentication
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Adds a 6-digit code from your phone to the login, so a stolen
            password is not enough on its own.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Spinner /> Checking…
          </div>
        ) : enrolling ? (
          <form onSubmit={confirmEnrol} className="space-y-4">
            <ol className="space-y-4 text-sm text-gray-700">
              <li>
                <strong>1.</strong> Scan this with Google Authenticator, Authy,
                or your password manager.
                <div className="mt-2 inline-block rounded-xl border border-leaf-100 bg-white p-3">
                  {/* Supabase returns the QR as an inline SVG data URI, which
                      is why the CSP img-src allows data:. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={enrolling.qr} alt="Two-factor setup QR code" className="h-44 w-44" />
                </div>
              </li>
              <li>
                <strong>2.</strong> Can&apos;t scan? Enter this key by hand:
                <code className="mt-1 block break-all rounded bg-leaf-50 px-2 py-1 font-mono text-xs">
                  {enrolling.secret}
                </code>
              </li>
              <li>
                <strong>3.</strong> Type the 6-digit code it shows:
                <input
                  className="input mt-1 max-w-[10rem] text-center font-mono text-lg tracking-[0.3em]"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  required
                  autoFocus
                />
              </li>
            </ol>
            <div className="flex gap-3">
              <button type="submit" disabled={busy || code.length !== 6} className="btn-primary">
                {busy && <Spinner />}
                {busy ? 'Verifying…' : 'Turn on 2FA'}
              </button>
              <button type="button" onClick={cancelEnrol} disabled={busy} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        ) : verified.length > 0 ? (
          <div className="space-y-3">
            <p className="flex items-center gap-2 rounded-lg border border-leaf-200 bg-leaf-50 px-3 py-2 text-sm text-leaf-800">
              <span aria-hidden="true">✅</span>
              Two-factor authentication is <strong>on</strong>.
            </p>
            {verified.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-leaf-100 px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-gray-700">
                  {f.friendly_name || 'Authenticator app'}
                </span>
                <button
                  onClick={() => remove(f.id)}
                  disabled={busy}
                  className="shrink-0 text-xs text-red-500 transition-colors hover:text-red-700 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span aria-hidden="true">⚠️</span>
              Two-factor authentication is <strong>off</strong>.
            </p>
            <button onClick={startEnrol} disabled={busy} className="btn-primary">
              {busy && <Spinner />}
              {busy ? 'Preparing…' : 'Set up 2FA'}
            </button>
          </div>
        )}
      </section>

      <section className="card space-y-2">
        <h2 className="font-bold text-leaf-900">
          <span aria-hidden="true">⏱️</span> Automatic Logout
        </h2>
        <p className="text-sm text-gray-500">
          This admin portal signs you out after{' '}
          <strong>{Math.round(IDLE_LIMIT_MS / 60000)} minutes</strong> without
          activity, with a warning shortly before. It protects the session if
          you leave the page open on a shared computer.
        </p>
      </section>
    </div>
  );
}
