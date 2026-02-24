'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface NotifRow {
  id: string;
  title: string;
  message: string | null;
  type: string;
  read_at: string | null;
  link: string | null;
  created_at: string;
}

export function NotificationsList({ notifications }: { notifications: NotifRow[] }) {
  const router = useRouter();

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`rounded-lg border p-4 ${n.read_at ? 'opacity-75' : 'bg-muted/30'}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{n.title}</p>
              {n.message && <p className="text-sm text-muted-foreground mt-1">{n.message}</p>}
              <p className="text-xs text-muted-foreground mt-2">{formatDate(n.created_at)}</p>
            </div>
            {!n.read_at && (
              <button
                onClick={() => markRead(n.id)}
                className="text-sm text-primary hover:underline"
              >
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No notifications yet.
        </div>
      )}
    </div>
  );
}
