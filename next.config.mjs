/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';

// The site talks to exactly one external origin: its own Supabase project.
// Deriving it from the env var keeps the CSP correct across dev/preview/prod
// without a second place to update. The placeholder only matters when Supabase
// has not been configured yet, in which case nothing calls out anyway.
const supabaseOrigin = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
).origin;

// Content-Security-Policy.
//
// `script-src` keeps 'unsafe-inline' and that is deliberate, not an oversight:
// app/layout.js inlines BOOT_SCRIPT, and the App Router inlines its own
// `self.__next_f.push(...)` RSC payload into every page. Removing it would
// require a per-request nonce from middleware, and Next only supports nonces on
// dynamically rendered pages — which would disable the `revalidate = 60` ISR
// caching every page here depends on. So this CSP does NOT stop injected inline
// script; lib/safeUrl.js is what does that. What it does buy:
//   - no script can be loaded from an off-site origin
//   - no <object>/<embed>, no framing, no <base> rewrite, no cross-origin POST
//   - connect-src limits exfiltration to Supabase, so a stolen value has
//     nowhere to be sent
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  // data: is required for the TOTP enrolment QR code, which Supabase returns
  // as an inline SVG data URI.
  `img-src 'self' data: ${supabaseOrigin}`,
  "font-src 'self' data:",
  // ws: in dev only, for the Next.js hot-reload socket.
  `connect-src 'self' ${supabaseOrigin}${isDev ? ' ws: http://localhost:*' : ''}`,
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy backstop for browsers that predate frame-ancestors.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
];

const nextConfig = {
  // Was `hostname: '**'`, which left /_next/image acting as an open image proxy
  // for any HTTPS URL on the internet. Nothing in the app uses next/image, so
  // narrowing this to the Supabase storage bucket removes the capability
  // without changing a single rendered pixel.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(supabaseOrigin).hostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Next sets this by default; naming the server is free reconnaissance.
  poweredByHeader: false,

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // The admin portal must never be indexed or cached by an intermediary.
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
