'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { UserRole } from '@/lib/database.types';

export async function updateUserRole(userId: string, newRole: UserRole) {
    const admin = createAdminClient();

    const { error } = await admin
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/dashboard/admin/users');
    return { success: true };
}
