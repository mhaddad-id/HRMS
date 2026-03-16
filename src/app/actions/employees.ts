'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { employeeSchema, type EmployeeFormValues } from '@/lib/validations/employee';
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
  const employeePayload: any = {
    user_id: userId,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    position: data.position,
    salary: data.salary,
    employment_date: data.employment_date,
    status: data.status,
    gender: data.gender,
    currency: data.currency || 'USD',
  };

  // Map other fields and handle empty strings
  const otherFields = [
    'identity_no', 'phone', 'father_name', 'mother_name',
    'date_of_birth', 'address', 'emergency_contact',
    'office', 'office_id', 'supervisor_id', 'ending_date',
    'supervisor', 'annual_score', 'sick_score', 'competence_score'
  ];

  otherFields.forEach(field => {
    const val = (data as any)[field];
    employeePayload[field] = (typeof val === 'string' && val.trim() === '') ? null : val;
  });

  const { error: insertError } = await admin.from('employees').insert(employeePayload);

  if (insertError) {
    // Attempt rollback
    await admin.auth.admin.deleteUser(userId);
    return { error: 'Failed to create employee record: ' + insertError.message };
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function updateEmployee(employeeId: string, values: Partial<EmployeeFormValues>) {
  console.log('updateEmployee called with:', { employeeId, values });
  const admin = createAdminClient();

  // We use Partial because updates might not include all fields (like password)
  // But for the employee record, we want to ensure basic validation
  const parsed = employeeSchema.partial().safeParse(values);
  if (!parsed.success) {
    return { error: 'Validation failed: ' + Object.values(parsed.error.flatten().fieldErrors).join(', ') };
  }

  const data = parsed.data;

  // 1. Update Employee Record
  const employeePayload: any = {};

  // Use a safer way to build the payload from parsed data
  const fields = [
    'first_name', 'last_name', 'identity_no', 'email', 'phone',
    'father_name', 'mother_name', 'date_of_birth', 'address',
    'emergency_contact', 'position', 'office', 'office_id',
    'supervisor_id', 'salary', 'employment_date', 'ending_date',
    'supervisor', 'annual_score', 'sick_score', 'competence_score',
    'status', 'gender', 'currency'
  ];

  fields.forEach(field => {
    if (data[field as keyof typeof data] !== undefined) {
      const val = data[field as keyof typeof data];
      // Convert empty strings to null for database compatibility (especially for dates/UUIDs)
      employeePayload[field] = (typeof val === 'string' && val.trim() === '') ? null : val;
    }
  });

  // Skip undefined values to avoid overwriting with null if they weren't provided
  Object.keys(employeePayload).forEach(key => employeePayload[key] === undefined && delete employeePayload[key]);

  console.log('updateEmployee payload:', employeePayload);

  const { data: updatedRows, error: updateError } = await admin
    .from('employees')
    .update(employeePayload)
    .eq('id', employeeId)
    .select();

  if (updateError) {
    return { error: 'Failed to update employee record: ' + updateError.message };
  }

  if (!updatedRows || updatedRows.length === 0) {
    return { error: 'No employee record found with id: ' + employeeId };
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}
