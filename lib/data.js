import { supabase, supabaseConfigured } from './supabase';
import {
  defaultContent,
  defaultFeatures,
  defaultSteps,
  defaultTeam,
  defaultPosts,
} from './defaults';

// All fetchers fall back to default content when Supabase is not
// configured or a query fails, so the site always renders.

export async function getContent(key) {
  if (!supabaseConfigured) return defaultContent[key];
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return data?.value ?? defaultContent[key];
}

// Merged over the defaults so a partially-saved settings object never leaves a
// flag `undefined` (which would read as "off").
export async function getMotionSettings() {
  const value = await getContent('motion');
  return { ...defaultContent.motion, ...(value ?? {}) };
}

export async function getFeatures() {
  if (!supabaseConfigured) return defaultFeatures;
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'features')
    .maybeSingle();
  return data?.value ?? defaultFeatures;
}

export async function getSteps() {
  if (!supabaseConfigured) return defaultSteps;
  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'steps')
    .maybeSingle();
  return data?.value ?? defaultSteps;
}

export async function getTeam() {
  if (!supabaseConfigured) return defaultTeam;
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true });
  return data && data.length ? data : defaultTeam;
}

export async function getPosts() {
  if (!supabaseConfigured) return defaultPosts;
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
  return data && data.length ? data : defaultPosts;
}

export async function getPost(slug) {
  if (!supabaseConfigured) {
    return defaultPosts.find((p) => p.slug === slug) ?? null;
  }
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return data ?? defaultPosts.find((p) => p.slug === slug) ?? null;
}
