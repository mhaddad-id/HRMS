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
import { Ban, MoreHorizontal, Pencil, RotateCcw, Trash2, UserRoundCog } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { EmployeeForm } from './employee-form';
import { formatCurrency, formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Employee } from '@/lib/database.types';
import type { Department } from '@/lib/database.types';
import { useToast } from '@/hooks/use-toast';

interface EmployeesTableProps {
  employees: (Employee & { department?: { id: string; name: string; code: string } | null })[];
  departments: Pick<Department, 'id' | 'name' | 'code'>[];
}

const columnHelper = createColumnHelper<
  Employee & { department?: { id: string; name: string; code: string } | null }
>();

export function EmployeesTable({ employees, departments }: EmployeesTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const [editing, setEditing] = useState<Employee | null>(null);

  const columns: ColumnDef<
    Employee & { department?: { id: string; name: string; code: string } | null },
    any
  >[] = [
    columnHelper.accessor('pay_no', { header: 'Pay No', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor((r) => `${r.first_name} ${r.last_name}`, {
      id: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('employee_code', { header: 'Code' }),
    columnHelper.accessor('identity_no', { header: 'Identity No', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('phone', { header: 'Phone', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('emergency_contact', {
      header: 'Emergency Contact',
      cell: (i) => i.getValue() ?? '—',
    }),
    columnHelper.accessor('date_of_birth', {
      header: 'Date of Birth',
      cell: (i) => (i.getValue() ? formatDate(i.getValue() as string) : '—'),
    }),
    columnHelper.accessor('address', {
      header: 'Address',
      cell: (i) =>
        i.getValue() ? <span className="block max-w-[18rem] truncate">{i.getValue()}</span> : '—',
    }),
    columnHelper.accessor((r) => r.department?.name ?? '—', {
      id: 'department',
      header: 'Department',
    }),
    columnHelper.accessor('office', { header: 'Office', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('position', { header: 'Position' }),
    columnHelper.accessor('supervisor', { header: 'Supervisor', cell: (i) => i.getValue() ?? '—' }),
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('employment_date', {
      header: 'Starting date',
      cell: (info) => formatDate(info.getValue() as string),
    }),
    columnHelper.accessor('ending_date', {
      header: 'Ending date',
      cell: (info) => (info.getValue() ? formatDate(info.getValue() as string) : '—'),
    }),
    columnHelper.accessor('annual_score', {
      header: 'Annual',
      cell: (i) => (i.getValue() ?? 0) as any,
    }),
    columnHelper.accessor('sick_score', {
      header: 'Sick',
      cell: (i) => (i.getValue() ?? 0) as any,
    }),
    columnHelper.accessor('competence_score', {
      header: 'Competence',
      cell: (i) => (i.getValue() ?? 0) as any,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span
          className={
            info.getValue() === 'active'
              ? 'text-green-600 dark:text-green-400'
              : 'text-muted-foreground'
          }
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(row.original)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const current = row.original.status;
                const next = current === 'active' ? 'inactive' : 'active';
                const msg =
                  next === 'inactive' ? 'Disable this employee?' : 'Enable this employee?';
                if (!confirm(msg)) return;
                const supabase = createClient();
                const { error } = await supabase
                  .from('employees')
                  .update({ status: next })
                  .eq('id', row.original.id);
                if (error) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                  return;
                }
                toast({ title: 'Success', description: `Employee ${next}.` });
                router.refresh();
              }}
            >
              <Ban className="mr-2 h-4 w-4" />
              {row.original.status === 'active' ? 'Disable' : 'Enable'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                if (!confirm('Reset annual/sick/competence scores to 0?')) return;
                const supabase = createClient();
                const { error } = await supabase
                  .from('employees')
                  .update({ annual_score: 0, sick_score: 0, competence_score: 0 })
                  .eq('id', row.original.id);
                if (error) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                  return;
                }
                toast({ title: 'Success', description: 'Scores reset.' });
                router.refresh();
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                if (!confirm('Delete this employee?')) return;
                const supabase = createClient();
                const { error } = await supabase.from('employees').delete().eq('id', row.original.id);
                if (error) {
                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                  return;
                }
                toast({ title: 'Deleted', description: 'Employee removed.' });
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
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search employees..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm w-full sm:w-auto"
        />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {table.getRowModel().rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No employees found</p>
            <p>Try adjusting your search or add a new employee from the top right.</p>
          </div>
        ) : (
          <div className="relative w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b bg-muted/60">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground"
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
                    className="border-b last:border-0 odd:bg-muted/20 hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-middle">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
                1}
            </span>{' '}
            -{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium">{table.getFilteredRowModel().rows.length}</span>{' '}
            employees
          </span>
        </div>
        <div className="flex gap-2">
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
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editing && (
            <EmployeeForm
              departments={departments}
              initial={{
                id: editing.id,
                employee_code: editing.employee_code,
                pay_no: editing.pay_no ?? undefined,
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
                department_id: editing.department_id ?? undefined,
                position: editing.position,
                salary: Number(editing.salary),
                employment_date: editing.employment_date,
                ending_date: editing.ending_date ?? undefined,
                supervisor: editing.supervisor ?? undefined,
                office: editing.office ?? undefined,
                annual_score: editing.annual_score ?? 0,
                sick_score: editing.sick_score ?? 0,
                competence_score: editing.competence_score ?? 0,
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
