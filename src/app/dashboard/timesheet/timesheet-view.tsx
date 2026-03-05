'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  employee?: { first_name: string; last_name: string; employee_code: string; office: string | null } | null;
}

const columnHelper = createColumnHelper<TimesheetRow>();

export function TimesheetView({
  timesheets,
  employeeId,
  isHR,
}: {
  timesheets: TimesheetRow[];
  employeeId?: string;
  isHR?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);

  // Get unique offices for filter
  const offices = Array.from(new Set(timesheets.map(t => t.employee?.office).filter(Boolean))).sort();

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

  const columns = [
    ...(isHR ? [
      columnHelper.accessor((r) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '—', {
        id: 'employee_name',
        header: 'Employee',
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium">{info.getValue()}</span>
            <span className="text-xs text-muted-foreground">{info.row.original.employee?.employee_code}</span>
          </div>
        ),
      }),
      columnHelper.accessor((r) => r.employee?.office ?? '—', {
        id: 'office',
        header: 'Office',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        filterFn: 'equals',
      }),
    ] : []),
    columnHelper.accessor('work_date', {
      header: 'Date',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('clock_in', {
      header: 'Clock in',
      cell: (info) => info.getValue() ? new Date(info.getValue()!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    }),
    columnHelper.accessor('clock_out', {
      header: 'Clock out',
      cell: (info) => info.getValue() ? new Date(info.getValue()!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    }),
    columnHelper.accessor('regular_hours', {
      header: 'Regular (h)',
      cell: (info) => Number(info.getValue()),
    }),
    columnHelper.accessor('overtime_hours', {
      header: 'Overtime (h)',
      cell: (info) => Number(info.getValue()),
    }),
    columnHelper.accessor('late_minutes', {
      header: 'Late (min)',
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data: timesheets,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {employeeId && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Log Hours</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log working hours</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save Entry'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {isHR && (
            <div className="flex items-center gap-2">
              <Select
                value={(table.getColumn('office')?.getFilterValue() as string) ?? 'all'}
                onValueChange={(value) =>
                  table.getColumn('office')?.setFilterValue(value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9">
                  <SelectValue placeholder="All Offices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Offices</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office} value={office!}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search employees..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-9 h-9 max-w-sm w-full sm:w-[240px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/50 text-left">
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="p-12 text-center text-muted-foreground bg-muted/10">
            No timesheet entries found.
          </div>
        )}
      </div>
    </div>
  );
}
