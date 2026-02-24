'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/env';

export function createClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseAnonKey());
}
