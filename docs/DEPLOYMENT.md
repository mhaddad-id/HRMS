# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- (Optional) Vercel account for hosting

## 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon (public) key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret; use only server-side if needed).
3. Run migrations:
   - **Option A**: Supabase CLI  
     `supabase link --project-ref <ref>` then `supabase db push`
   - **Option B**: SQL Editor in Dashboard – run in order:
     - `001_initial_schema.sql`
     - `002_rls_policies.sql`
     - `003_seed_departments.sql`
4. **Auth**: In Authentication → Providers, enable Email. Optionally set Site URL and Redirect URLs to your app URL (e.g. `https://your-app.vercel.app`).

## 2. Environment Variables

Create `.env.local` (and in your hosting dashboard for production):

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

For local dev, `NEXT_PUBLIC_APP_URL=http://localhost:3000`.

## 3. Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register a user; optionally set role to Admin in DB for full access.

## 4. Deploy to Vercel

1. Push code to GitHub (or connect your repo in Vercel).
2. In Vercel: New Project → Import repo → Framework Preset: Next.js.
3. Add the same environment variables in **Settings → Environment Variables**.
4. Deploy. Set **Settings → Domains** if using a custom domain.

## 5. Post-Deploy

- Set Supabase **Authentication → URL Configuration**:  
  Site URL = `https://your-app.vercel.app`, Redirect URLs = `https://your-app.vercel.app/**`.
- Create first admin: register in app, then in Supabase SQL Editor:
  `UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';`

## 6. Optional: Profile Photo Storage

1. In Supabase Dashboard → Storage, create bucket `avatars` (or `profile-photos`).
2. Set policies: authenticated users can read; users can upload/update object where `name` matches their user id or path.
3. In app, use Supabase client `storage.from('avatars').upload(...)` and save returned public URL to `users.avatar_url` or `employees.profile_photo_url`.

## 7. Optional: Email Notifications

- Use Supabase Auth hooks (Dashboard → Authentication → Hooks) to send emails on signup/password reset.
- For leave approval, payroll ready, etc.: Supabase Edge Functions or a Next.js API route with a transactional email provider (SendGrid, Resend, etc.) and call it from server actions after updating leave/payroll.

## Security Checklist

- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.
- [ ] RLS is enabled on all tables and policies are tested per role.
- [ ] Redirect URLs in Supabase are restricted to your app domain(s).
- [ ] HTTPS only in production.
