'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// An admin session left open on a shared or unattended machine is a standing
// invitation. Supabase refresh tokens keep a session alive indefinitely, so
// nothing expires it on its own — this hook does.
export const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
export const WARN_BEFORE_MS = 2 * 60 * 1000; //  warn for the final 2 minutes

// Shared across tabs: without this, each open admin tab would run its own timer
// and a tab you were actively using could be logged out by an idle sibling.
const STORAGE_KEY = 'cs:admin:lastActivity';
// Activity is continuous but writes need not be — one per 5s is plenty.
const WRITE_THROTTLE_MS = 5000;

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'];

function readLastActivity() {
  try {
    const raw = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(raw) && raw > 0 ? raw : Date.now();
  } catch {
    // Private browsing / storage disabled — fall back to this tab only.
    return Date.now();
  }
}

function writeLastActivity(at) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    /* non-fatal: the in-memory ref still drives this tab's timer */
  }
}

// Call at the moment a user actually authenticates. The stored timestamp
// outlives the session it belonged to, so without this a value left behind by
// an earlier visit is still sitting in localStorage when the next login lands —
// the timer below reads it, finds it long past the limit, and signs the
// brand-new session straight back out a second later.
export function markActivityNow() {
  writeLastActivity(Date.now());
}

// Dropped on sign-out so no stale timestamp is left for the next login (or the
// next person on a shared machine) to inherit.
export function clearActivity() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable means there is nothing stored to clear */
  }
}

/**
 * Signs the admin out after IDLE_LIMIT_MS without interaction.
 *
 * @param {object}   options
 * @param {boolean}  options.enabled  false while logged out, so the timer does
 *                                    not run on the login screen
 * @param {function} options.onExpire called once when the limit is reached
 * @returns {{ warning: boolean, secondsLeft: number, stayActive: function }}
 */
export default function useIdleLogout({ enabled, onExpire }) {
  const [msLeft, setMsLeft] = useState(IDLE_LIMIT_MS);
  const lastActivityRef = useRef(Date.now());
  const lastWriteRef = useRef(0);
  // Kept in a ref so a changing onExpire identity does not restart the timer.
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const markActive = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    if (now - lastWriteRef.current > WRITE_THROTTLE_MS) {
      lastWriteRef.current = now;
      writeLastActivity(now);
    }
  }, []);

  // Resets the countdown from the warning banner's "I'm still here" button.
  const stayActive = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastWriteRef.current = now;
    writeLastActivity(now);
    setMsLeft(IDLE_LIMIT_MS);
    // Re-arm: the button is only useful if it can un-fire a countdown that has
    // just reached zero.
    firedRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    firedRef.current = false;
    lastActivityRef.current = readLastActivity();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, markActive, { passive: true });
    }

    // Another tab reporting activity counts for this one too.
    function onStorage(e) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      const at = Number(e.newValue);
      if (Number.isFinite(at) && at > lastActivityRef.current) {
        lastActivityRef.current = at;
      }
    }
    window.addEventListener('storage', onStorage);

    // A backgrounded tab gets throttled timers, so re-sync on return rather
    // than trusting how many ticks actually ran.
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        lastActivityRef.current = readLastActivity();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    const id = setInterval(() => {
      const remaining = IDLE_LIMIT_MS - (Date.now() - lastActivityRef.current);
      setMsLeft(remaining);
      if (remaining <= 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current?.();
      }
    }, 1000);

    return () => {
      clearInterval(id);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, markActive);
      }
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, markActive]);

  return {
    warning: enabled && msLeft <= WARN_BEFORE_MS && msLeft > 0,
    secondsLeft: Math.max(0, Math.ceil(msLeft / 1000)),
    stayActive,
  };
}
