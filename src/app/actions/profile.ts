'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function resetPassword(formData: FormData) {
  const newPassword = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
export async function updateProfilePhoto(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    return { error: 'No file provided.' };
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // 1. Fetch employee to get their ID (we might need it for the path)
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!employee) return { error: 'Employee record not found.' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${employee.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 2. Upload to storage (storage still needs user token if possible, else admin)
  // Let's use the standard supabase client first for the upload
  const { error: uploadError } = await supabase.storage
    .from('hrms-assets')
    .upload(filePath, file);

  if (uploadError) {
    // If it fails with RLS, try admin client for storage too
    const { error: adminUploadError } = await admin.storage
      .from('hrms-assets')
      .upload(filePath, file);

    if (adminUploadError) {
      return { error: 'Upload failed: ' + adminUploadError.message };
    }
  }

  // 3. Get public URL
  const { data: { publicUrl } } = admin.storage
    .from('hrms-assets')
    .getPublicUrl(filePath);

  // 4. Update employee and user record using admin client to bypass DB RLS
  const { error: updateError } = await admin
    .from('employees')
    .update({ profile_photo_url: publicUrl })
    .eq('id', employee.id);

  if (updateError) {
    return { error: 'Failed to update profile: ' + updateError.message };
  }

  // Also update users table for consistency
  await admin
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);

  revalidatePath('/dashboard/profile');
  return { success: true, url: publicUrl };
}
