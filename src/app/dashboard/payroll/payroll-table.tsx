'use client';

import { formatDate, formatMoney } from '@/lib/utils';

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
    first_name: string;
    last_name: string;
    employee_code: string;
    email?: string | null;
    supervisor?: string | null;
    position?: string | null;
    salary?: number | null;
  } | null;
}

export function PayrollTable({ payrolls }: { payrolls: PayrollRow[] }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm min-w-[1200px]">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">First Name</th>
            <th className="px-4 py-3 text-left font-medium">Last Name</th>
            <th className="px-4 py-3 text-left font-medium">Supervisor</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Position</th>
            <th className="px-4 py-3 text-left font-medium">Worked days</th>
            <th className="px-4 py-3 text-left font-medium">Deduction</th>
            <th className="px-4 py-3 text-left font-medium">Leave without pay</th>
            <th className="px-4 py-3 text-left font-medium">Salary</th>
            <th className="px-4 py-3 text-left font-medium">Currency</th>
            <th className="px-4 py-3 text-left font-medium">Period</th>
            <th className="px-4 py-3 text-left font-medium">Net</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr key={p.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3 whitespace-nowrap">{p.employee?.first_name ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{p.employee?.last_name ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{p.employee?.supervisor ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{p.employee?.email ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{p.employee?.position ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{p.worked_days ?? 0}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatMoney(Number(p.deductions), p.currency ?? 'USD')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatMoney(Number(p.leave_without_pay ?? 0), p.currency ?? 'USD')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatMoney(Number(p.employee?.salary ?? p.base_salary), p.currency ?? 'USD')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{p.currency ?? 'USD'}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(p.period_start)} – {formatDate(p.period_end)}
              </td>
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {formatMoney(Number(p.net_salary), p.currency ?? 'USD')}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payrolls.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">No payroll records yet.</div>
      )}
    </div>
  );
}
