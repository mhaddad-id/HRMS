'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LeaveRow {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string } | null;
}

export function LeaveList({
  leaves,
  isHR,
}: {
  leaves: LeaveRow[];
  isHR: boolean;
}) {
  const router = useRouter();

  async function updateStatus(leaveId: string, status: 'approved' | 'rejected') {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('leaves')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', leaveId);
    router.refresh();
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {isHR && <th className="px-4 py-3 text-left font-medium">Employee</th>}
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Start</th>
            <th className="px-4 py-3 text-left font-medium">End</th>
            <th className="px-4 py-3 text-left font-medium">Reason</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            {isHR && <th className="px-4 py-3 text-left font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l.id} className="border-b hover:bg-muted/30">
              {isHR && (
                <td className="px-4 py-3">
                  {l.employee
                    ? `${l.employee.first_name} ${l.employee.last_name} (${l.employee.employee_code})`
                    : '—'}
                </td>
              )}
              <td className="px-4 py-3 capitalize">{l.leave_type}</td>
              <td className="px-4 py-3">{formatDate(l.start_date)}</td>
              <td className="px-4 py-3">{formatDate(l.end_date)}</td>
              <td className="px-4 py-3 max-w-[200px] truncate">{l.reason ?? '—'}</td>
              <td className="px-4 py-3">
                <span
                  className={
                    l.status === 'approved'
                      ? 'text-green-600 dark:text-green-400'
                      : l.status === 'rejected'
                        ? 'text-destructive'
                        : 'text-amber-600 dark:text-amber-400'
                  }
                >
                  {l.status}
                </span>
              </td>
              {isHR && l.status === 'pending' && (
                <td className="px-4 py-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateStatus(l.id, 'approved')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(l.id, 'rejected')}>
                    Reject
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {leaves.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No leave records yet.</div>
      )}
    </div>
  );
}
