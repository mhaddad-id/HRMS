'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check, Bell, Info, BellOff } from 'lucide-react';
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
    <div className="space-y-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`relative rounded-xl border p-4 transition-all hover:shadow-md hover:border-emerald-200 ${n.read_at ? 'bg-card opacity-75' : 'bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm border-emerald-100'
            }`}
        >
          {/* Unread animated dot indicator */}
          {!n.read_at && (
            <span className="absolute -left-1 -top-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 rounded-full p-2 flex-shrink-0 ${n.read_at ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'}`}>
                {n.type?.toLowerCase().includes('info') ? <Info className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              </div>
              <div>
                <p className={`font-medium ${!n.read_at ? 'text-emerald-950 dark:text-emerald-50' : ''}`}>{n.title}</p>
                {n.message && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>}
                <p className="text-xs text-muted-foreground mt-2 font-medium">{formatDate(n.created_at)}</p>
              </div>
            </div>
            {!n.read_at && (
              <button
                onClick={() => markRead(n.id)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-100/50 hover:bg-emerald-200/50 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Check className="h-3.5 w-3.5" />
                Mark read
              </button>
            )}
          </div>
        </div>
      ))}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-muted/20">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground">
            <BellOff className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-1">No notifications yet</h3>
          <p className="text-sm text-muted-foreground">You are all caught up!</p>
        </div>
      )}
    </div>
  );
}
