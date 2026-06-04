'use client';

import { useState, useMemo } from 'react';
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
import {
  Search,
  Printer,
  TrendingDown,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatMoney, formatDate, cn } from '@/lib/utils';
import { MonthPicker } from '@/components/ui/month-picker';


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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Calculations for Summary Cards
  const totalAmount = payrolls.reduce((sum, r) => sum + r.amount, 0);
  const totalDeductions = payrolls.reduce((sum, r) => sum + r.deduction, 0);
  const totalLwp = payrolls.reduce((sum, r) => sum + r.lwp, 0);
  const currency = payrolls[0]?.currency || 'USD';

  const filteredData = useMemo(() =>
    payrolls.filter(p =>
      p.name.toLowerCase().includes(globalFilter.toLowerCase()) ||
      p.position.toLowerCase().includes(globalFilter.toLowerCase())
    ),
    [payrolls, globalFilter]
  );

  const selectedPayroll = useMemo(() => payrolls.find(p => p.id === selectedId) || null, [payrolls, selectedId]);

  const columns = useMemo<ColumnDef<PayrollRow, any>[]>(() => [
    columnHelper.accessor('name', {
      header: 'Employee',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-emerald-100 shadow-sm">
            <AvatarFallback className="bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              {info.getValue().split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold text-sm tracking-tight">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('office_name', {
      header: 'Office',
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('worked_days', {
      header: 'Days',
      cell: (info) => <span className="text-sm font-medium">{info.getValue()}d</span>,
    }),
    columnHelper.accessor('lwp', {
      header: 'LWP',
      cell: (info) => (
        <span className={cn(
          "text-sm font-medium",
          info.getValue() > 0 ? "text-destructive" : "text-muted-foreground opacity-30"
        )}>
          {info.getValue() > 0 ? `${info.getValue()}d` : '—'}
        </span>
      ),
    }),

    columnHelper.accessor('salary', {
      header: 'Base Salary',
      cell: (info) => <span className="text-sm font-medium">{formatMoney(info.getValue(), info.row.original.currency)}</span>,
    }),


    columnHelper.accessor('deduction', {
      header: 'Deductions',
      cell: (info) => (
        <span className={cn(
          "text-sm font-medium",
          info.getValue() > 0 ? "text-destructive" : "text-muted-foreground opacity-30"
        )}>
          {info.getValue() > 0 ? `-${formatMoney(info.getValue(), info.row.original.currency)}` : '—'}
        </span>
      ),
    }),

    columnHelper.accessor('currency', {
      header: 'Currency',
      cell: (info) => (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0 border-emerald-100 uppercase tracking-wider shadow-none">
          {info.getValue()}
        </Badge>
      ),
    }),
    columnHelper.accessor('amount', {
      header: 'Net Pay',
      cell: (info) => (
        <span className="text-sm font-bold text-emerald-600">{formatMoney(info.getValue(), info.row.original.currency)}</span>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-emerald-600 text-white overflow-hidden relative group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={120} />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-80">Total Net Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(totalAmount, currency)}</div>
            <p className="text-[10px] opacity-70 mt-1">Aggregate for {currentMonth}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatMoney(totalDeductions, currency)}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              <span>Reduced from base salaries</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrolls.length}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Paid this period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card overflow-hidden relative group">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">LWP Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalLwp}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Total unpaid leave</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Layout ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Table & Controls */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-card/50 p-4 rounded-2xl border border-muted shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Period</span>
                <MonthPicker
                  value={currentMonth}
                  onValueChangeAction={(val) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (val) {
                      params.set('month', val);
                    } else {
                      params.delete('month');
                    }
                    router.push(`?${params.toString()}`);
                  }}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Location</span>
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
                  <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl bg-background border-muted text-sm font-medium">
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
              </div>

              <div className="flex flex-col gap-1 sm:w-auto w-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">Search</span>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Find employee..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-background border-muted text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 sm:pt-0">
              <Button
                variant="outline"
                className="h-10 rounded-xl gap-2 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all font-bold"
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
      
            .header {
              display: grid;
              grid-template-columns: 1fr auto;
              align-items: end;
              padding-bottom: 24px;
              margin-bottom: 36px;
              border-bottom: 1.5px solid var(--ink);
              gap: 24px;
            }
      
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
              >
                <Printer className="h-4 w-4" />
                Print Worksheet
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id} className="bg-emerald-600/5 hover:bg-emerald-600/5">
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-emerald-800/70 whitespace-nowrap"
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {table.getRowModel().rows.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <div className="p-4 bg-muted/20 rounded-full mb-2">
                  <FileText className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <p className="font-bold text-foreground">No payroll records</p>
                <p className="text-xs text-muted-foreground">Adjust filters to find staff members.</p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
