'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { employeeSchema } from '@/lib/validations/employee';
import type { UserRole } from '@/lib/database.types';

export async function createEmployee(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  
  // Format numbers to avoid string vs number issues from FormData
  const values = {
    ...raw,
    salary: raw.salary ? Number(raw.salary) : 0,
    annual_score: raw.annual_score ? Number(raw.annual_score) : 0,
    sick_score: raw.sick_score ? Number(raw.sick_score) : 0,
    competence_score: raw.competence_score ? Number(raw.competence_score) : 0,
  };

  const parsed = employeeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: 'Validation failed: ' + Object.values(parsed.error.flatten().fieldErrors).join(', ') };
  }

  const admin = createAdminClient();
  const data = parsed.data;

  // 1. Create User via Supabase Admin (Auth)
  if (!data.password) {
    return { error: 'Password is required to create a new employee account.' };
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      full_name: `${data.first_name} ${data.last_name}`,
      role: 'employee' as UserRole,
    },
  });

  if (authError) {
    return { error: 'Failed to create user account: ' + authError.message };
  }

  const userId = authData.user.id;

  // 2. Insert into users profile table (should be handled by a trigger, but we also do it manually in signUp sometimes)
  // Let's explicitly create the public.users record
  const { error: profileError } = await admin.from('users').upsert({
    id: userId,
    email: data.email,
    role: 'employee',
    full_name: `${data.first_name} ${data.last_name}`,
  }, { onConflict: 'id' });

  if (profileError) {
      // Cleanup auth user if profile fails
      await admin.auth.admin.deleteUser(userId);
      return { error: 'Failed to create user profile: ' + profileError.message };
  }


  // 3. Create Employee Record
  const employeePayload = {
    user_id: userId,
    // Database trigger or sequence will generate employee_code if omitted
    first_name: data.first_name,
    last_name: data.last_name,
    identity_no: data.identity_no || null,
    email: data.email,
    phone: data.phone || null,
    father_name: data.father_name || null,
    mother_name: data.mother_name || null,
    date_of_birth: data.date_of_birth || null,
    address: data.address || null,
    emergency_contact: data.emergency_contact || null,
    position: data.position,
    office: data.office || null,
    office_id: data.office_id || null,
    supervisor_id: data.supervisor_id || null,
    salary: data.salary,
    employment_date: data.employment_date,
    ending_date: data.ending_date || null,
    supervisor: data.supervisor || null,
    annual_score: data.annual_score ?? 0,
    sick_score: data.sick_score ?? 0,
    competence_score: data.competence_score ?? 0,
    status: data.status,
  };

  const { error: insertError } = await admin.from('employees').insert(employeePayload);

  if (insertError) {
    // Attempt rollback
    await admin.auth.admin.deleteUser(userId);
    return { error: 'Failed to create employee record: ' + insertError.message };
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}
