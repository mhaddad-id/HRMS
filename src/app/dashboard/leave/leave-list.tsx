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
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface LeaveRow {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
    office: { id: string; name: string } | null;
    supervisor_id: string | null;
    supervisor_record?: { id: string; first_name: string; last_name: string } | null;
  } | null;
}

const columnHelper = createColumnHelper<LeaveRow>();

export function LeaveList({
  leaves,
  isHR,
  canApprove,
  userRole,
  currentEmployeeId,
  requiresOfficeSelection,
}: {
  leaves: LeaveRow[];
  isHR: boolean;
  canApprove: boolean;
  userRole?: string;
  currentEmployeeId?: string;
  requiresOfficeSelection?: boolean;
}) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function calculateDays(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  async function updateStatus(leaveId: string, status: 'approved' | 'rejected', notes?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (status === 'approved') {
      const { data: leave } = await supabase
        .from('leaves')
        .select('employee_id, leave_type, start_date, end_date')
        .eq('id', leaveId)
        .single();

      if (leave && (leave.leave_type === 'annual' || leave.leave_type === 'sick')) {
        const duration = calculateDays(leave.start_date, leave.end_date);
        const { data: employee } = await supabase
          .from('employees')
          .select('annual_score, sick_score')
          .eq('id', leave.employee_id)
          .single();

        if (employee) {
          const updateData: any = {};
          if (leave.leave_type === 'annual') {
            updateData.annual_score = (employee.annual_score || 0) - duration;
          } else if (leave.leave_type === 'sick') {
            updateData.sick_score = (employee.sick_score || 0) - duration;
          }

          await supabase
            .from('employees')
            .update(updateData)
            .eq('id', leave.employee_id);
        }
      }
    }

    await supabase
      .from('leaves')
      .update({
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', leaveId);
    router.refresh();
  }

  const handleReject = async () => {
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      await updateStatus(rejectingId, 'rejected', rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      columnHelper.accessor((r) => {
        const s = r.employee?.supervisor_record;
        return s ? `${s.first_name} ${s.last_name}` : '—';
      }, {
        id: 'supervisor',
        header: 'Supervisor',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      columnHelper.accessor((r) => r.employee?.office?.name ?? '—', {
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
        <div className="flex flex-col">
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
          {info.row.original.status === 'rejected' && info.row.original.review_notes && (
            <span className="text-[10px] text-muted-foreground italic max-w-[150px] truncate" title={info.row.original.review_notes}>
              Reason: {info.row.original.review_notes}
            </span>
          )}
        </div>
      ),
    }),
    ...(isHR || currentEmployeeId ? [
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          if (row.original.status !== 'pending') return null;

          const emp: any = row.original.employee;
          const empObj = Array.isArray(emp) ? emp[0] : emp;
          const empSupervisorId = empObj?.supervisor_id;

          const isSupervisor = currentEmployeeId && empSupervisorId === currentEmployeeId;
          const isAdmin = userRole === 'admin';

          if (isSupervisor || isAdmin) {
            return (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(row.original.id, 'approved')}>
                  Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectingId(row.original.id)}>
                  Reject
                </Button>
              </div>
            );
          }

          return null;
        }
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
          <div className="relative w-[300px]">
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
          <div className="p-8 text-center text-muted-foreground">
            {requiresOfficeSelection
              ? "Please select an office to view leave records."
              : "No leave records found."}
          </div>
        )}
      </div>

      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
            >
              {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
