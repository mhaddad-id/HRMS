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
import { MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { Employee } from '@/lib/database.types';

type EmployeeRow = Employee & {
  supervisor?: { id: string; first_name: string; last_name: string } | null;
};

interface EmployeesTableProps {
  employees: EmployeeRow[];
}

const columnHelper = createColumnHelper<EmployeeRow>();

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isActive
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function EmployeeAvatar({ first_name, last_name }: { first_name: string; last_name: string }) {
  const initials = `${first_name[0] ?? ''}${last_name[0] ?? ''}`.toUpperCase();
  const colors = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  ];
  const colorIdx = (first_name.charCodeAt(0) + last_name.charCodeAt(0)) % colors.length;
  return (
    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${colors[colorIdx]}`}>
      {initials}
    </div>
  );
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);
  const [editing, setEditing] = useState<EmployeeRow | null>(null);

  // Get unique offices for filter
  const offices = Array.from(new Set(employees.map(e => e.office).filter(Boolean))).sort();

  const columns: ColumnDef<EmployeeRow, any>[] = [
    // ... existing columns ...
    columnHelper.accessor('employee_code', {
      header: 'ID',
      cell: (info) => (
        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((r) => `${r.first_name} ${r.last_name}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2.5">
            <EmployeeAvatar first_name={row.first_name} last_name={row.last_name} />
            <div>
              <p className="font-medium text-sm leading-tight">{info.getValue()}</p>
              <p className="text-xs text-muted-foreground leading-tight">{row.email}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor('office', {
      header: 'Office',
      cell: (info) => info.getValue() ? (
        <span className="text-sm">{info.getValue()}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
      filterFn: 'equals',
    }),

    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor((r) => r.supervisor ? `${r.supervisor.first_name} ${r.supervisor.last_name}` : null, {
      id: 'supervisor',
      header: 'Supervisor',
      cell: (info) => info.getValue() ? (
        <span className="text-sm">{info.getValue()}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
    }),
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => <span className="text-sm font-medium">{formatCurrency(info.getValue())}</span>,
    }),
    columnHelper.accessor('employment_date', {
      header: 'Joined',
      cell: (info) => <span className="text-sm text-muted-foreground">{formatDate(info.getValue())}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <StatusBadge status={info.getValue()} />,
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
              className="text-destructive rounded-lg"
              onClick={async () => {
                if (!confirm('Delete this employee?')) return;
                const supabase = createClient();
                await supabase.from('employees').delete().eq('id', row.original.id);
                router.refresh();
              }}
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
          <div className="relative w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b bg-muted/50">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                email: editing.email,
                phone: editing.phone ?? undefined,
                position: editing.position,
                office: editing.office ?? undefined,
                supervisor_id: editing.supervisor_id ?? undefined,
                salary: Number(editing.salary),
                employment_date: editing.employment_date,
                status: editing.status,
              }}
              onSuccess={() => {
                setEditing(null);
                router.refresh();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
