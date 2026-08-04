// URL sanitisers for values that arrive from the database.
//
// Admin-editable fields (hero.cta_link, cover_url, photo_url) end up directly
// in `href`/`src` attributes. React escapes text, but it does NOT stop a
// `javascript:` URL from executing when the visitor clicks the link — so any
// DB value used as a URL has to pass through here first.

// Schemes that are safe to navigate to.
const LINK_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);
// Images may only ever be fetched over the network, never inlined.
const IMAGE_SCHEMES = new Set(['http:', 'https:']);

// Browsers ignore control characters and whitespace when resolving a URL, so a
// stored "java<TAB>script:alert(1)" still navigates as `javascript:`. Strip C0
// controls, space and DEL before parsing — none are meaningful in a real URL.
// Written as a code-point test rather than a regex literal so this source file
// contains no raw control bytes.
function normalise(value) {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (code > 0x20 && code !== 0x7f) out += ch;
  }
  return out;
}

// Parsed with no base, so anything without an explicit scheme throws and is
// rejected. Relative inputs are handled by the callers before reaching here.
function schemeOf(url) {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}

// `/news` is a path; `//evil.com` is protocol-relative and must not qualify.
function isSiteRelative(url) {
  return url.startsWith('#') || (url.startsWith('/') && !url.startsWith('//'));
}

/**
 * Returns `value` when it is a link the site is willing to render, otherwise
 * `fallback`. Same-site paths (`/news`, `#main`) pass through unchanged.
 */
export function safeUrl(value, fallback = '#') {
  const url = normalise(value);
  if (!url) return fallback;
  if (isSiteRelative(url)) return url;

  return LINK_SCHEMES.has(schemeOf(url)) ? url : fallback;
}

/**
 * Returns `value` when it is an http(s) image URL, otherwise ''. An empty
 * string is the right fallback because every call site already branches on a
 * falsy URL to render its placeholder.
 */
export function safeImageUrl(value) {
  const url = normalise(value);
  if (!url) return '';
  if (isSiteRelative(url)) return url;

  return IMAGE_SCHEMES.has(schemeOf(url)) ? url : '';
}

/**
 * Used by the admin forms so a bad URL is rejected at save time rather than
 * silently collapsing to '#' on the public site. Returns an error message, or
 * '' when the value is acceptable.
 */
export function validateLinkInput(value, label = 'Link') {
  const url = normalise(value);
  if (!url) return '';
  if (isSiteRelative(url)) return '';

  const scheme = schemeOf(url);
  if (scheme === 'http:' || scheme === 'https:') return '';
  return `${label} must start with https:// or / — "${value}" is not allowed.`;
}

// Deliberately permissive: this catches typos and obvious junk, not every
// invalid address. It exists so a malformed value can't produce a broken
// `mailto:` on the contact page.
export function isEmailish(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
