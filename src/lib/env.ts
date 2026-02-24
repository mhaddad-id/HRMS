/**
 * Supabase env vars. Throws a clear error if missing.
 * Copy .env.example to .env.local and set your project URL and anon key.
 */

const SETUP_LINK = 'https://supabase.com/dashboard/project/_/settings/api';

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      `Missing NEXT_PUBLIC_SUPABASE_URL. Copy .env.example to .env.local and add your Supabase project URL. Get it from: ${SETUP_LINK}`
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      `Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and add your Supabase anon key. Get it from: ${SETUP_LINK}`
    );
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      `Missing SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and add your Supabase service role key. Get it from: ${SETUP_LINK}`
    );
  }
  return key;
}
