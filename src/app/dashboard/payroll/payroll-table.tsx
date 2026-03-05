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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PayrollRow {
  id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  overtime_pay: number;
  deductions: number;
  net_salary: number;
  status: string;
  employee?: { first_name: string; last_name: string; employee_code: string; office: string | null } | null;
}

const columnHelper = createColumnHelper<PayrollRow>();

export function PayrollTable({ payrolls }: { payrolls: PayrollRow[] }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);

  // Get unique offices for filter
  const offices = Array.from(new Set(payrolls.map(p => p.employee?.office).filter(Boolean))).sort();

  const columns = [
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
    columnHelper.accessor((r) => `${formatDate(r.period_start)} – ${formatDate(r.period_end)}`, {
      id: 'period',
      header: 'Period',
    }),
    columnHelper.accessor('base_salary', {
      header: 'Base',
      cell: (info) => formatCurrency(Number(info.getValue())),
    }),
    columnHelper.accessor('overtime_pay', {
      header: 'Overtime',
      cell: (info) => formatCurrency(Number(info.getValue())),
    }),
    columnHelper.accessor('deductions', {
      header: 'Deductions',
      cell: (info) => formatCurrency(Number(info.getValue())),
    }),
    columnHelper.accessor('net_salary', {
      header: 'Net',
      cell: (info) => <span className="font-bold">{formatCurrency(Number(info.getValue()))}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span className={`capitalize ${info.getValue() === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
          {info.getValue()}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: payrolls,
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
              <tr key={row.id} className="border-b hover:bg-muted/30">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No payroll records found.</div>
        )}
      </div>
    </div>
  );
}
