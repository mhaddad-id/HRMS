'use client';

import { formatDate } from '@/lib/utils';

interface MeetingRow {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
}

export function MeetingsList({ meetings }: { meetings: MeetingRow[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">When</th>
            <th className="px-4 py-3 text-left font-medium">Duration</th>
            <th className="px-4 py-3 text-left font-medium">Location</th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m) => (
            <tr key={m.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{m.title}</div>
                {m.description && (
                  <div className="text-muted-foreground truncate max-w-xs">{m.description}</div>
                )}
              </td>
              <td className="px-4 py-3">
                {new Date(m.scheduled_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">{m.duration_minutes} min</td>
              <td className="px-4 py-3">{m.location ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {meetings.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No upcoming meetings.</div>
      )}
    </div>
  );
}
