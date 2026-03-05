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
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LeaveRow {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  employee?: { id: string; first_name: string; last_name: string; employee_code: string; office: string | null } | null;
}

const columnHelper = createColumnHelper<LeaveRow>();

export function LeaveList({
  leaves,
  isHR,
}: {
  leaves: LeaveRow[];
  isHR: boolean;
}) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);

  // Get unique offices for filter
  const offices = Array.from(new Set(leaves.map(l => l.employee?.office).filter(Boolean))).sort();

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
    columnHelper.accessor('leave_type', {
      header: 'Type',
      cell: (info) => <span className="capitalize">{info.getValue()}</span>,
    }),
    columnHelper.accessor('start_date', {
      header: 'Start',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('end_date', {
      header: 'End',
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('reason', {
      header: 'Reason',
      cell: (info) => <span className="max-w-[200px] truncate block">{info.getValue() ?? '—'}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span
          className={
            info.getValue() === 'approved'
              ? 'text-green-600 dark:text-green-400'
              : info.getValue() === 'rejected'
                ? 'text-destructive'
                : 'text-amber-600 dark:text-amber-400'
          }
        >
          {info.getValue()}
        </span>
      ),
    }),
    ...(isHR ? [
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => row.original.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => updateStatus(row.original.id, 'approved')}>
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateStatus(row.original.id, 'rejected')}>
              Reject
            </Button>
          </div>
        )
      })
    ] : [])
  ];

  const table = useReactTable({
    data: leaves,
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

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      )}

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
              <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
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
          <div className="p-8 text-center text-muted-foreground">No leave records found.</div>
        )}
      </div>
    </div>
  );
}
