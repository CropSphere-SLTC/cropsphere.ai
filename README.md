# 🌱 Cropsphere.ai — Informational Website

Informational site for the Cropsphere.ai final year project (AI chatbot for Sri Lankan farmers), with a public site and an admin portal for updating all content.

**Stack:** Next.js 14 (App Router) · Tailwind CSS · Supabase (database, auth, storage) · Vercel (hosting)

## Pages

**Public:** Home, About, Features, How It Works, News/Newsletters, Our Team, Contact
**Admin (`/admin`):** Dashboard, News & Newsletters, Team, Site Content (hero, about, features, steps, contact)

The site works immediately with default content even before Supabase is set up — everything falls back to `lib/defaults.js`.

## 1. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 2. Set up Supabase (free)

1. Create a project at https://supabase.com (free tier).
2. In the dashboard, open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Go to **Authentication → Users → Add user** and create your admin account (email + password), then **disable public signups** in Authentication → Providers.
4. Grant that account admin rights — logging in is not enough on its own. In the SQL Editor, run the `insert into admin_users …` statement at the bottom of `supabase/schema.sql` with your email.
5. Go to **Project Settings → API** and copy the Project URL and anon key.
6. Copy `.env.local.example` to `.env.local` and paste the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

7. Restart `npm run dev`, visit `/admin/login`, and log in.
8. Turn on two-factor authentication at **Admin → Security** (recommended).

> **Upgrading an existing install?** Run `supabase/security.sql` once instead —
> it migrates the old "any logged-in user is an admin" policies to the
> allowlist. Read the comments at the top first; you must set your own email in
> STEP 5 or you will lock yourself out.

## 3. Deploy free on Vercel

1. Push this folder to a GitHub repo.
2. Go to https://vercel.com → New Project → import the repo.
3. Add the two environment variables from `.env.local` in Vercel's project settings.
4. Deploy. Done — public site + admin portal live on one URL.

Content changes made in the admin portal appear on the public site within ~60 seconds (pages revalidate every minute).

## Customising

- Colors/theme: `tailwind.config.js` (the `leaf` palette)
- Default text: `lib/defaults.js`
- Chatbot link: set the hero "Button link" in Admin → Site Content

## Notes

- Security model: writing anything requires membership of the `admin_users` allowlist, which can only be changed from the Supabase SQL editor. See [SECURITY.md](SECURITY.md) for the full set of controls and a verification checklist.
- Images uploaded in the admin portal go to the public `images` storage bucket. Only JPG/PNG/WebP/AVIF up to 5 MB are accepted; SVG is refused because it can carry script.
