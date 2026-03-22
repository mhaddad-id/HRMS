'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { unstable_noStore as noStore } from 'next/cache';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  link?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  link,
}: CreateNotificationParams) {
  const admin = createAdminClient();

  const { error } = await admin.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    link,
  });

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function markNotificationsAsRead(userId: string) {
  const admin = createAdminClient();

  const { error } = await admin
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('Error marking notifications as read:', error);
    return { success: false, error };
  }

  return { success: true };
}

export async function fetchUnreadCount(userId: string) {
  noStore();
  const admin = createAdminClient();

  const { count, error } = await admin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}
