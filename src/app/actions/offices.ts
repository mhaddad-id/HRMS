'use server';

import { createClient } from '@/lib/supabase/server';
import { canManageOfficeAccess } from '@/lib/auth/role-access';
import { revalidatePath } from 'next/cache';

async function requireOfficeAccessManager() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!canManageOfficeAccess(profile?.role)) {
    throw new Error('Forbidden: admin or HR manager access required');
  }

  return supabase;
}

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
  const supabase = await requireOfficeAccessManager();
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data;
}

export async function getOfficeAccess(officeId: string) {
  const supabase = await requireOfficeAccessManager();
  const { data, error } = await supabase
    .from('office_access')
    .select(`
      *,
      users (
        full_name,
        email,
        role
      )
    `)
    .eq('office_id', officeId);

  if (error) throw new Error(error.message);
  return data;
}

export async function updateOfficeAccess(accessId: string, updates: {
  is_admin?: boolean;
}) {
  const supabase = await requireOfficeAccessManager();

  // First fetch the existing record to know the user_id and office_id
  const { data: accessRecord, error: fetchError } = await supabase
    .from('office_access')
    .select('user_id, office_id')
    .eq('id', accessId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { data, error } = await supabase
    .from('office_access')
    .update(updates)
    .eq('id', accessId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If making them an admin, ensure their primary office is set
  if (updates.is_admin) {
    const { data: officeData } = await supabase
      .from('offices')
      .select('name')
      .eq('id', accessRecord.office_id)
      .single();

    if (officeData) {
      await supabase
        .from('employees')
        .update({
          office_id: accessRecord.office_id,
          office: officeData.name
        })
        .eq('user_id', accessRecord.user_id);
    }
  }

  revalidatePath('/dashboard/offices');
  revalidatePath('/dashboard/employees');
  return data;
}

export async function addUserToOffice(officeId: string, userId: string, initialPermissions: {
  is_admin?: boolean;
}) {
  const supabase = await requireOfficeAccessManager();
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

  // Set their primary office to this office
  const { data: officeData } = await supabase
    .from('offices')
    .select('name')
    .eq('id', officeId)
    .single();

  if (officeData) {
    await supabase
      .from('employees')
      .update({
        office_id: officeId,
        office: officeData.name
      })
      .eq('user_id', userId);
  }

  revalidatePath('/dashboard/offices');
  revalidatePath('/dashboard/employees');
  return data;
}

export async function removeUserFromOffice(accessId: string) {
  const supabase = await requireOfficeAccessManager();
  const { error } = await supabase
    .from('office_access')
    .delete()
    .eq('id', accessId);

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/offices');
}
