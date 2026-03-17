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
    columnHelper.accessor('salary', {
      header: 'Salary',
      cell: (info) => <span className="text-sm">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
    }),

    columnHelper.accessor('deduction', {
      header: 'Deduction',
      cell: (info) => <span className="text-sm font-medium text-destructive">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --ink: #0f0f0f;
        --ink-mid: #4a4a4a;
        --ink-light: #8a8a8a;
        --rule: #d8d5cf;
        --accent: #1a3a2a;
        --accent-light: #e8f0eb;
        --paper: #faf9f7;
        --white: #ffffff;
        --danger-light: #fff4f2;
        --danger: #c0392b;
      }

      body {
        font-family: 'DM Sans', sans-serif;
        background: var(--paper);
        color: var(--ink);
        padding: 48px 56px;
        font-size: 13px;
        line-height: 1.5;
        min-height: 100vh;
      }

      /* ── Header ─────────────────────────────── */
      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: end;
        padding-bottom: 24px;
        margin-bottom: 36px;
        border-bottom: 1.5px solid var(--ink);
        gap: 24px;
      }

      .header-left {}

      .eyebrow {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--ink-light);
        margin-bottom: 6px;
      }

      .title {
        font-family: 'DM Serif Display', serif;
        font-size: 36px;
        font-weight: 400;
        color: var(--ink);
        line-height: 1.1;
        letter-spacing: -0.01em;
      }

      .subtitle {
        margin-top: 6px;
        font-size: 13px;
        color: var(--ink-mid);
        font-weight: 300;
      }

      .header-meta {
        text-align: right;
      }

      .meta-badge {
        display: inline-block;
        background: var(--accent);
        color: #e8f0eb;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.06em;
        padding: 5px 12px;
        border-radius: 2px;
        margin-bottom: 8px;
      }

      .meta-date {
        font-size: 11px;
        color: var(--ink-light);
        font-family: 'DM Mono', monospace;
      }

      /* ── Summary strip ───────────────────────── */
      .summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1px;
        background: var(--rule);
        border: 1px solid var(--rule);
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 36px;
      }

      .summary-item {
        background: var(--white);
        padding: 16px 20px;
      }

      .summary-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--ink-light);
        margin-bottom: 6px;
      }

      .summary-value {
        font-family: 'DM Mono', monospace;
        font-size: 18px;
        font-weight: 500;
        color: var(--ink);
        letter-spacing: -0.02em;
      }

      .summary-value.large {
        font-size: 20px;
        color: var(--accent);
      }

      /* ── Table ───────────────────────────────── */
      .table-wrap {
        border: 1px solid var(--rule);
        border-radius: 4px;
        overflow: hidden;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead tr {
        background: var(--ink);
      }

      thead th {
        padding: 11px 14px;
        font-size: 9.5px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #c8c5be;
        text-align: left;
        white-space: nowrap;
      }

      thead th.text-right { text-align: right; }

      tbody tr {
        border-bottom: 1px solid var(--rule);
        transition: background 0.1s;
      }

      tbody tr:last-child { border-bottom: none; }

      tbody tr:nth-child(even) { background: #f5f4f1; }

      tbody tr:hover { background: var(--accent-light); }

      tbody td {
        padding: 12px 14px;
        vertical-align: middle;
        color: var(--ink);
      }

      td.name {
        font-weight: 500;
        font-size: 13px;
      }

      td.position {
        color: var(--ink-mid);
        font-size: 12px;
      }

      td.mono {
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        letter-spacing: -0.01em;
      }

      td.text-right { text-align: right; }

      td.currency-badge span {
        display: inline-block;
        background: var(--accent-light);
        color: var(--accent);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.06em;
        padding: 2px 7px;
        border-radius: 2px;
      }

      td.lwp-cell {
        color: var(--ink-light);
        font-size: 12px;
      }

      td.lwp-cell.has-lwp {
        color: var(--danger);
        font-weight: 500;
      }

      td.amount-cell {
        font-family: 'DM Mono', monospace;
        font-weight: 500;
        font-size: 13px;
        text-align: right;
        color: var(--ink);
      }

      td.deduction-cell {
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        text-align: right;
        color: var(--ink-light);
      }

      td.deduction-cell.has-deduction {
        color: var(--danger);
      }

      /* ── Tfoot ───────────────────────────────── */
      tfoot tr {
        background: var(--ink);
      }

      tfoot td {
        padding: 13px 14px;
        color: #c8c5be;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      tfoot td.total-value {
        font-family: 'DM Mono', monospace;
        font-size: 14px;
        font-weight: 500;
        text-align: right;
        color: #e8f0eb;
        letter-spacing: -0.01em;
        text-transform: none;
      }

      tfoot td.total-label {
        text-align: right;
      }

      /* ── Footer ──────────────────────────────── */
      .footer {
        margin-top: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid var(--rule);
      }

      .footer-note {
        font-size: 11px;
        color: var(--ink-light);
      }

      .sig-block {
        margin-top: 48px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 48px;
      }

      .sig-line {
        border-top: 1px solid var(--ink);
        padding-top: 8px;
        font-size: 11px;
        color: var(--ink-mid);
        letter-spacing: 0.04em;
      }

      @media print {
        body { padding: 24px 32px; background: white; }
        tbody tr:hover { background: transparent; }
        .summary-item { background: white; }
      }
    </style>
  </head>
  <body>

    <div class="header">
      <div class="header-left">
        <div class="eyebrow">Confidential Document</div>
        <div class="title">Payroll Worksheet</div>
        <div class="subtitle">${monthName}${currentOffice !== 'all' ? ` &mdash; ${currentOffice} Office` : ' &mdash; All Offices'}</div>
      </div>
      <div class="header-meta">
        <div class="meta-badge">${currentOffice !== 'all' ? currentOffice : 'All Offices'}</div>
      </div>
    </div>

    <div class="summary">
      <div class="summary-item">
        <div class="summary-label">Employees</div>
        <div class="summary-value">${payrolls.length}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total LWP Days</div>
        <div class="summary-value">${payrolls.reduce((s, r) => s + (r.lwp || 0), 0)}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Deductions</div>
        <div class="summary-value">${formatMoney(payrolls.reduce((s, r) => s + r.deduction, 0), payrolls[0]?.currency || 'USD')}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Net Payroll</div>
        <div class="summary-value large">${formatMoney(payrolls.reduce((s, r) => s + r.amount, 0), payrolls[0]?.currency || 'USD')}</div>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Position</th>
            <th class="text-right">Worked Days</th>
            <th class="text-right">LWP</th>
            <th class="text-right">Deduction</th>
            <th class="text-right">Base Salary</th>
            <th>CCY</th>
            <th class="text-right">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          ${payrolls.map((r, i) => `
            <tr>
              <td class="mono" style="color: var(--ink-light); width: 36px;">${String(i + 1).padStart(2, '0')}</td>
              <td class="name">${r.name}</td>
              <td class="position">${r.position}</td>
              <td class="mono text-right">${r.worked_days}</td>
              <td class="lwp-cell ${r.lwp > 0 ? 'has-lwp' : ''} text-right">${r.lwp > 0 ? `${r.lwp}d` : '—'}</td>
              <td class="deduction-cell ${r.deduction > 0 ? 'has-deduction' : ''}">${r.deduction > 0 ? formatMoney(r.deduction, r.currency) : '—'}</td>
              <td class="mono text-right">${formatMoney(r.salary, r.currency)}</td>
              <td class="currency-badge"><span>${r.currency}</span></td>
              <td class="amount-cell">${formatMoney(r.amount, r.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" class="total-label">Totals</td>
            <td class="total-value">${formatMoney(payrolls.reduce((s, r) => s + r.deduction, 0), payrolls[0]?.currency || 'USD')}</td>
            <td class="total-value">${formatMoney(payrolls.reduce((s, r) => s + r.salary, 0), payrolls[0]?.currency || 'USD')}</td>
            <td></td>
            <td class="total-value">${formatMoney(payrolls.reduce((s, r) => s + r.amount, 0), payrolls[0]?.currency || 'USD')}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      <div class="footer-note">This document is confidential and intended for authorized personnel only.</div>
    </div>

    <div class="sig-block">
      <div class="sig-line">Prepared by &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <div class="sig-line">Approved by &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
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
                  <td colSpan={4} className="px-4 py-3 text-right uppercase tracking-wider text-[10px]">
                    Monthly Totals
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatMoney(payrolls.reduce((sum, r) => sum + r.salary, 0), payrolls[0]?.currency || 'USD')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-destructive">
                    {formatMoney(payrolls.reduce((sum, r) => sum + r.deduction, 0), payrolls[0]?.currency || 'USD')}
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
