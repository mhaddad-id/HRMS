'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getOffices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offices')
    .select('*, employees(id)')
    .order('name');

  if (error) throw new Error(error.message);

  return (data ?? []).map((office) => ({
    ...office,
    employee_count: Array.isArray(office.employees) ? office.employees.length : 0,
  }));
}

export async function createOffice(formData: {
  name: string;
  address?: string;
  working_hours_start?: string;
  working_hours_end?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offices')
    .insert([formData])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
  return data;
}

export async function updateOffice(id: string, updates: {
  name?: string;
  address?: string;
  working_hours_start?: string;
  working_hours_end?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('offices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
  return data;
}

export async function deleteOffice(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('offices')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
}

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
}

export async function getOfficeAccess(officeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('office_access')
    .select(`
      *,
      users (
        full_name,
        email
      )
    `)
    .eq('office_id', officeId);

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOfficeAccess(accessId: string, updates: {
  is_admin?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('office_access')
    .update(updates)
    .eq('id', accessId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
  return data;
}

export async function addUserToOffice(officeId: string, userId: string, initialPermissions: {
  is_admin?: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('office_access')
    .insert([{
      office_id: officeId,
      user_id: userId,
      ...initialPermissions
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
  return data;
}

export async function removeUserFromOffice(accessId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('office_access')
    .delete()
    .eq('id', accessId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
}
