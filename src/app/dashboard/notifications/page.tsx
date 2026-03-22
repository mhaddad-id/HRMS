import { createClient } from '@/lib/supabase/server';
import { BellRing } from 'lucide-react';
import { NotificationsList } from './notifications-list';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-200/50 rounded-lg">
          <BellRing className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Notifications</h1>
          <p className="text-muted-foreground">Your notifications</p>
        </div>
      </div>
      <NotificationsList notifications={notifications ?? []} />
    </div>
  );
}
