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
import { Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatMoney, formatDate } from '@/lib/utils';

interface PayrollRow {
  id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  overtime_pay: number;
  deductions: number;
  worked_days?: number | null;
  leave_without_pay?: number | null;
  currency?: string | null;
  net_salary: number;
  status: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
    email?: string | null;
    supervisor?: string | null;
    position?: string | null;
    salary?: number | null;
    office?: { id: string; name: string } | null;
  } | null;
}

const columnHelper = createColumnHelper<PayrollRow>();

export function PayrollTable({ payrolls }: { payrolls: PayrollRow[] }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);

  // Get unique offices for filter
  const offices = Array.from(new Set(payrolls.map(p => p.employee?.office?.name).filter(Boolean))).sort();

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
    columnHelper.accessor((r) => r.employee?.office?.name ?? '—', {
      id: 'office',
      header: 'Office',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      filterFn: 'equals',
    }),
    columnHelper.accessor('period_start', {
      header: 'Period',
      cell: (r) => `${formatDate(r.row.original.period_start)} – ${formatDate(r.row.original.period_end)}`,
    }),
    columnHelper.accessor('worked_days', {
      header: 'Worked Days',
      cell: (i) => i.getValue() ?? 0,
    }),
    columnHelper.accessor('base_salary', {
      header: 'Base',
      cell: (info) => formatMoney(Number(info.getValue()), info.row.original.currency ?? 'USD'),
    }),
    columnHelper.accessor('overtime_pay', {
      header: 'Overtime',
      cell: (info) => formatMoney(Number(info.getValue()), info.row.original.currency ?? 'USD'),
    }),
    columnHelper.accessor('deductions', {
      header: 'Deductions',
      cell: (info) => formatMoney(Number(info.getValue()), info.row.original.currency ?? 'USD'),
    }),
    columnHelper.accessor('leave_without_pay', {
      header: 'LWP',
      cell: (info) => formatMoney(Number(info.getValue() ?? 0), info.row.original.currency ?? 'USD'),
    }),
    columnHelper.accessor('net_salary', {
      header: 'Net',
      cell: (info) => (
        <span className="font-bold">
          {formatMoney(Number(info.getValue()), info.row.original.currency ?? 'USD')}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => (
        <span
          className={`capitalize font-medium ${info.getValue() === 'paid' ? 'text-emerald-600' : 'text-amber-600'
            }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => {
            const r = info.row.original;
            const printContent = `
              <html>
                <head>
                  <title>Payroll - ${r.employee?.first_name} ${r.employee?.last_name}</title>
                  <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .label { font-weight: bold; }
                    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; }
                    @media print { .no-print { display: none; } }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Employee Payslip</h1>
                    <p>${r.employee?.first_name} ${r.employee?.last_name} (${r.employee?.employee_code})</p>
                  </div>
                  <div class="row"><span class="label">Period:</span> <span>${formatDate(r.period_start)} - ${formatDate(r.period_end)}</span></div>
                  <div class="row"><span class="label">Base Salary:</span> <span>${formatMoney(r.base_salary, r.currency ?? 'USD')}</span></div>
                  <div class="row"><span class="label">Overtime Pay:</span> <span>${formatMoney(r.overtime_pay, r.currency ?? 'USD')}</span></div>
                  <div class="row"><span class="label">Deductions:</span> <span>${formatMoney(r.deductions, r.currency ?? 'USD')}</span></div>
                  <div class="row"><span class="label">Net Salary:</span> <span style="font-size: 1.2em; font-weight: bold;">${formatMoney(r.net_salary, r.currency ?? 'USD')}</span></div>
                  <div class="footer">
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                  </div>
                </body>
              </html>
            `;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => {
                printWindow.print();
                printWindow.close();
              }, 250);
            }
          }}
        >
          <Printer className="h-4 w-4" />
        </Button>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 w-full sm:w-[240px]"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
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
          {table.getRowModel().rows.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <p className="font-semibold text-foreground">No payroll records found</p>
              <p className="text-sm text-muted-foreground">Records for the selected filters will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
