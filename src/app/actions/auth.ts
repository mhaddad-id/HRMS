'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';
import type { UserRole } from '@/lib/database.types';
import { roleHome } from '@/lib/auth/role-access';

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const raw = Object.fromEntries(formData.entries());
  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: { _form: [error.message] } };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: { _form: ['Sign in failed'] } };
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError || !profile?.role) {
    return { error: { _form: ['Account profile not found. Please contact support.'] } };
  }

  revalidatePath('/', 'layout');
  redirect(roleHome(profile.role as UserRole));
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const raw = Object.fromEntries(formData.entries());
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const role = parsed.data.role as UserRole;
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: { role },
    },
  });
  if (signUpError) {
    return { error: { _form: [signUpError.message] } };
  }
  if (!authData.user) {
    return { error: { _form: ['Sign up failed'] } };
  }

  const admin = createAdminClient();
  const { error: profileError } = await admin.from('users').insert({
    id: authData.user.id,
    email: parsed.data.email,
    role,
    created_at: new Date().toISOString(),
  });
  if (profileError && profileError.code !== '23505') {
    return { error: { _form: [profileError.message] } };
  }

  revalidatePath('/', 'layout');
  if (authData.session) {
    redirect(roleHome(role));
  }
  redirect('/login?message=confirm_email');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
