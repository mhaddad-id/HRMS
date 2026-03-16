'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  name: string;
  position: string;
  worked_days: number;
  lwp: number;
  deduction: number;
  salary: number;
  currency: string;
  amount: number;
  office_name: string;
}


const columnHelper = createColumnHelper<PayrollRow>();

export function PayrollTable({
  payrolls,
  allOffices,
  currentMonth
}: {
  payrolls: PayrollRow[];
  allOffices: { id: string; name: string }[];
  currentMonth: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentOffice = searchParams.get('office') ?? 'all';


  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ id: string; value: any }[]>([]);


  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => <span className="font-medium text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => <span className="text-sm text-muted-foreground">{info.getValue()}</span>,
    }),
    columnHelper.accessor('worked_days', {
      header: 'Worked Days',
      cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('lwp', {
      header: 'Leave without pay',
      cell: (info) => <span className="text-sm text-amber-600">{info.getValue()} days</span>,
    }),
    columnHelper.accessor('deduction', {
      header: 'Deduction',
      cell: (info) => <span className="text-sm font-medium text-destructive">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
    }),
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => <span className="text-sm">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
    }),
    columnHelper.accessor('currency', {
      header: 'Currency',
      cell: (info) => <span className="text-xs font-mono">{info.getValue()}</span>,
    }),
    columnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) => <span className="text-sm font-bold">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
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
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('month', e.target.value);
              } else {
                params.delete('month');
              }
              router.push(`?${params.toString()}`);
            }}
            className="w-full sm:w-[160px] h-9"
          />

          <Select
            value={currentOffice}
            onValueChange={(value) => {
              const params = new URLSearchParams(searchParams.toString());
              if (value === 'all') {
                params.delete('office');
              } else {
                params.set('office', value);
              }
              router.push(`?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {allOffices.map((office) => (
                <SelectItem key={office.id} value={office.name}>
                  {office.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 w-full sm:w-[240px]"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const [y, m] = currentMonth.split('-');
            const monthName = new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' });

            const printContent = `
              <html>
                <head>
                  <title>Payroll Worksheet - ${monthName}</title>
                  <style>
                    body { font-family: 'Inter', sans-serif; padding: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .header h1 { margin: 0; color: #111; font-size: 24px; }
                    .header p { margin: 5px 0 0; color: #666; font-size: 16px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { bg-color: #f8f9fa; font-weight: bold; text-transform: uppercase; font-size: 10px; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                    .footer { margin-top: 30px; font-size: 12px; }
                    .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
                    .totals-row { display: flex; justify-content: flex-end; gap: 40px; font-size: 14px; font-weight: bold; }
                    @media print { 
                      .no-print { display: none; } 
                      body { padding: 0; }
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>Payroll Worksheet</h1>
                    <p>${monthName}${currentOffice !== 'all' ? ` - ${currentOffice} Office` : ''}</p>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Worked Days</th>
                        <th>LWP</th>
                        <th>Deduction</th>
                        <th>Salary</th>
                        <th>Currency</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${payrolls.map(r => `
                        <tr>
                          <td>${r.name}</td>
                          <td>${r.position}</td>
                          <td>${r.worked_days}</td>
                          <td>${r.lwp} days</td>
                          <td class="text-right">${formatMoney(r.deduction, r.currency)}</td>
                          <td class="text-right">${formatMoney(r.salary, r.currency)}</td>
                          <td>${r.currency}</td>
                          <td class="text-right font-bold">${formatMoney(r.amount, r.currency)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                    <tfoot>
                      <tr class="font-bold">
                        <td colspan="5" class="text-right">TOTALS</td>
                        <td class="text-right">${formatMoney(payrolls.reduce((sum, r) => sum + r.salary, 0), payrolls[0]?.currency || 'USD')}</td>
                        <td></td>
                        <td class="text-right">${formatMoney(payrolls.reduce((sum, r) => sum + r.amount, 0), payrolls[0]?.currency || 'USD')}</td>
                      </tr>
                    </tfoot>
                  </table>
                  <div class="footer">
                    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
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
          className="h-9 gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
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
            {payrolls.length > 0 && (
              <tfoot className="bg-muted/50 border-t-2 font-bold">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right uppercase tracking-wider text-[10px]">
                    Monthly Totals
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatMoney(payrolls.reduce((sum, r) => sum + r.salary, 0), payrolls[0]?.currency || 'USD')}
                  </td>
                  <td></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-primary">
                    {formatMoney(payrolls.reduce((sum, r) => sum + r.amount, 0), payrolls[0]?.currency || 'USD')}
                  </td>
                </tr>
              </tfoot>
            )}
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
