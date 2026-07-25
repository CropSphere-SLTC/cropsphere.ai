import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// True when .env.local is configured with a real Supabase project
export const supabaseConfigured = Boolean(
  url && anonKey && !url.includes('YOUR_PROJECT')
);

// Falls back to a dummy client so the site still renders with default
// content before Supabase is set up.
export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;
