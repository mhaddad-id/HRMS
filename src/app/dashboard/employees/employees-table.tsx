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
import { Ban, MoreHorizontal, Pencil, RotateCcw, Trash2, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EmployeeForm } from './employee-form';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Employee } from '@/lib/database.types';
import { resetEmployeePassword } from '@/app/actions/employees';

type EmployeeRow = Omit<Employee, 'supervisor' | 'office'> & {
  supervisor_record?: { id: string; first_name: string; last_name: string; profile_photo_url?: string | null } | null;
  supervisor?: string | null;
  office?: { id: string; name: string } | null;
};

interface EmployeesTableProps {
  employees: EmployeeRow[];
  allOffices: { id: string; name: string }[];
}

const columnHelper = createColumnHelper<EmployeeRow>();

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={isActive
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-200'
        : 'text-red-500 dark:text-red-400 bg-red-300 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 border-red-200'}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function EmployeeAvatar({ first_name, last_name, profile_photo_url }: { first_name: string; last_name: string; profile_photo_url?: string | null }) {
  const initials = `${first_name[0] ?? ''}${last_name[0] ?? ''}`.toUpperCase();
  const colors = [
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400',
  ];
  const colorIdx = (first_name.charCodeAt(0) + last_name.charCodeAt(0)) % colors.length;
  return (
    <Avatar className="h-8 w-8 border border-border shadow-sm">
      <AvatarImage src={profile_photo_url ?? undefined} className="object-cover" />
      <AvatarFallback className={`text-xs font-bold ${colors[colorIdx]}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function EmployeesTable({ employees, allOffices }: EmployeesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ id: string; next: string } | null>(null);

  // Get unique offices for filter
  const offices = allOffices.map(o => o.name).filter(Boolean).sort();

  const columns: ColumnDef<EmployeeRow, any>[] = [
    columnHelper.accessor('employee_code', { header: 'Code', enableGlobalFilter: false }),
    columnHelper.accessor((r) => `${r.first_name} ${r.last_name}`, {
      id: 'name',
      header: 'Employee',
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <EmployeeAvatar first_name={row.first_name} last_name={row.last_name} profile_photo_url={(row as any).profile_photo_url} />
            <div>
              <p className="font-medium text-sm leading-tight">{info.getValue()}</p>
              <p className="text-xs text-muted-foreground leading-tight">{row.email}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('position', { header: 'Position', enableGlobalFilter: false }),
    columnHelper.accessor('identity_no', { header: 'Identity No', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor('date_of_birth', { header: 'DOB', cell: (i) => formatDate(i.getValue() as string), enableGlobalFilter: false }),
    columnHelper.accessor('phone', { header: 'Phone', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor('emergency_contact', { header: 'Emergency Contact', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor('father_name', { header: 'Father Name', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor('mother_name', { header: 'Mother Name', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor('address', { header: 'Address', cell: (i) => i.getValue() ?? '—', enableGlobalFilter: false }),
    columnHelper.accessor((r) => r.office?.name ?? '—', {
      id: 'office',
      header: 'Office',
      cell: (info) => (
        <span className="text-sm">{info.getValue()}</span>
      ),
      filterFn: 'equals',
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('gender', {
      header: 'Gender',
      cell: (i) => (
        <span className="capitalize text-sm">{i.getValue() ?? '—'}</span>
      ),
      enableGlobalFilter: false
    }),
    columnHelper.accessor('currency', {
      header: 'Currency',
      cell: (i) => (
        <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-muted">
          {i.getValue() ?? 'USD'}
        </span>
      ),
      enableGlobalFilter: false
    }),
    columnHelper.accessor((r) => {
      if (r.supervisor_record) {
        return `${r.supervisor_record.first_name} ${r.supervisor_record.last_name}`;
      }
      return r.supervisor;
    }, {
      id: 'supervisor',
      header: 'Supervisor',
      cell: (i) => {
        const val = i.getValue();
        const row = i.row.original;
        if (!val) return '—';
        if (row.supervisor_record) {
          return (
            <div className="flex items-center gap-2">
              <EmployeeAvatar
                first_name={row.supervisor_record.first_name}
                last_name={row.supervisor_record.last_name}
                profile_photo_url={row.supervisor_record.profile_photo_url}
              />
              <span className="text-sm">{val}</span>
            </div>
          );
        }
        return <span className="text-sm">{val}</span>;
      },
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => formatCurrency(info.getValue()),
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('employment_date', {
      header: 'Joined',
      cell: (info) => formatDate(info.getValue() as string),
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('ending_date', {
      header: 'Ending Date',
      cell: (info) => formatDate(info.getValue() as string),
      enableGlobalFilter: false,
    }),
    columnHelper.accessor('annual_score', { header: 'Annual Score', enableGlobalFilter: false }),
    columnHelper.accessor('sick_score', { header: 'Sick Score', enableGlobalFilter: false }),
    columnHelper.accessor('competence_score', { header: 'Comp. Score', enableGlobalFilter: false }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => setEditing(row.original)} className="rounded-lg">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => {
                const current = row.original.status;
                const next = current === 'active' ? 'inactive' : 'active';
                setConfirmStatus({ id: row.original.id, next });
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              {row.original.status === 'active' ? 'Disable' : 'Enable'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-lg"
              onClick={() => setConfirmReset(row.original.id)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive rounded-lg"
              onClick={() => setConfirmDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  const table = useReactTable({
    data: employees,
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
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Employee Directory</h2>
          <p className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} employee{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {table.getRowModel().rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No employees found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search or add a new employee.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                  {hg.headers.map((h) => (
                    <TableHead
                      key={h.id}
                      className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
          </span>{' '}
          –{' '}
          <span className="font-medium text-foreground">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length,
            )}
          </span>{' '}
          of{' '}
          <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span>{' '}
          employees
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Make changes to the employee's profile here.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <EmployeeForm
              employees={employees.filter((e) => e.id !== editing.id)}
              initial={{
                id: editing.id,
                employee_code: editing.employee_code,
                first_name: editing.first_name,
                last_name: editing.last_name,
                identity_no: editing.identity_no ?? undefined,
                email: editing.email,
                phone: editing.phone ?? undefined,
                father_name: editing.father_name ?? undefined,
                mother_name: editing.mother_name ?? undefined,
                date_of_birth: editing.date_of_birth ?? undefined,
                address: editing.address ?? undefined,
                emergency_contact: editing.emergency_contact ?? undefined,
                position: editing.position,
                office: typeof editing.office === 'string' ? editing.office : editing.office?.name,
                office_id: editing.office_id ?? undefined,
                supervisor_id: editing.supervisor_id ?? undefined,
                salary: Number(editing.salary),
                employment_date: editing.employment_date,
                ending_date: editing.ending_date ?? undefined,
                supervisor: (() => {
                  if (editing.supervisor_record) {
                    return `${editing.supervisor_record.first_name} ${editing.supervisor_record.last_name}`;
                  }
                  return editing.supervisor ?? undefined;
                })(),
                annual_score: editing.annual_score ?? 0,
                sick_score: editing.sick_score ?? 0,
                competence_score: editing.competence_score ?? 0,
                status: editing.status,
                gender: (editing as any).gender ?? 'male',
                currency: (editing as any).currency ?? 'USD',
              }}
              onSuccess={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Status Change */}
      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChangeAction={(o) => { if (!o) setConfirmStatus(null); }}
        title={confirmStatus?.next === 'inactive' ? 'Disable Employee' : 'Enable Employee'}
        description={`Are you sure you want to ${confirmStatus?.next === 'inactive' ? 'disable' : 'enable'} this employee?`}
        confirmLabel={confirmStatus?.next === 'inactive' ? 'Disable' : 'Enable'}
        onConfirmAction={async () => {
          if (!confirmStatus) return;
          const supabase = createClient();
          const { error } = await supabase.from('employees').update({ status: confirmStatus.next }).eq('id', confirmStatus.id);
          if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
          toast({ title: 'Success', description: `Employee ${confirmStatus.next}.` });
          router.refresh();
        }}
      />

      {/* Confirm Password Reset */}
      <ConfirmDialog
        open={!!confirmReset}
        onOpenChangeAction={(o) => { if (!o) setConfirmReset(null); }}
        title="Reset Password"
        description="Are you sure you want to reset the password for this employee to 'HRMS123'?"
        confirmLabel="Reset Password"
        onConfirmAction={async () => {
          if (!confirmReset) return;
          const res = await resetEmployeePassword(confirmReset);
          if (res.error) {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
            return;
          }
          toast({ title: 'Success', description: 'Password reset to HRMS123.' });
          setConfirmReset(null);
          router.refresh();
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChangeAction={(o) => { if (!o) setConfirmDelete(null); }}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirmAction={async () => {
          if (!confirmDelete) return;
          const supabase = createClient();
          const { error } = await supabase.from('employees').delete().eq('id', confirmDelete);
          if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
          toast({ title: 'Deleted', description: 'Employee removed.' });
          router.refresh();
        }}
      />
    </div>
  );
}
