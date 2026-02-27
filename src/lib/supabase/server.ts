import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // cookies() is read-only in Server Components; ignore write attempts
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // cookies() is read-only in Server Components; ignore write attempts
          }
        },
      },
    }
  );
}