'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface TimesheetRow {
  id: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  regular_hours: number;
  overtime_hours: number;
  late_minutes: number;
}

export function TimesheetView({
  timesheets,
  employeeId,
}: {
  timesheets: TimesheetRow[];
  employeeId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId || !date) return;
    setLoading(true);
    const supabase = createClient();
    const cin = date + 'T' + (clockIn || '09:00') + ':00';
    const cout = date + 'T' + (clockOut || '17:00') + ':00';
    const reg = Math.min(8, (new Date(cout).getTime() - new Date(cin).getTime()) / 36e5);
    const ot = Math.max(0, (new Date(cout).getTime() - new Date(cin).getTime()) / 36e5 - 8);
    await supabase.from('timesheets').upsert(
      {
        employee_id: employeeId,
        work_date: date,
        clock_in: cin,
        clock_out: cout,
        regular_hours: Math.round(reg * 100) / 100,
        overtime_hours: Math.round(ot * 100) / 100,
        late_minutes: 0,
      },
      { onConflict: 'employee_id,work_date' }
    );
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {employeeId && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Log Hours</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log working hours</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clock in</Label>
                  <Input type="time" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Clock out</Label>
                  <Input type="time" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Clock in</th>
              <th className="px-4 py-3 text-left font-medium">Clock out</th>
              <th className="px-4 py-3 text-left font-medium">Regular (h)</th>
              <th className="px-4 py-3 text-left font-medium">Overtime (h)</th>
              <th className="px-4 py-3 text-left font-medium">Late (min)</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map((t) => (
              <tr key={t.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3">{formatDate(t.work_date)}</td>
                <td className="px-4 py-3">
                  {t.clock_in ? new Date(t.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  {t.clock_out ? new Date(t.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </td>
                <td className="px-4 py-3">{Number(t.regular_hours)}</td>
                <td className="px-4 py-3">{Number(t.overtime_hours)}</td>
                <td className="px-4 py-3">{t.late_minutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {timesheets.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No timesheet entries yet.</div>
        )}
      </div>
    </div>
  );
}
