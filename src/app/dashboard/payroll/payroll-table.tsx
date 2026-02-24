'use client';

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
  employee?: { first_name: string; last_name: string; employee_code: string } | null;
}

export function PayrollTable({ payrolls }: { payrolls: PayrollRow[] }) {
  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium">Employee</th>
            <th className="px-4 py-3 text-left font-medium">Period</th>
            <th className="px-4 py-3 text-left font-medium">Base</th>
            <th className="px-4 py-3 text-left font-medium">Overtime</th>
            <th className="px-4 py-3 text-left font-medium">Deductions</th>
            <th className="px-4 py-3 text-left font-medium">Net</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {payrolls.map((p) => (
            <tr key={p.id} className="border-b hover:bg-muted/30">
              <td className="px-4 py-3">
                {p.employee
                  ? `${p.employee.first_name} ${p.employee.last_name}`
                  : '—'}
              </td>
              <td className="px-4 py-3">
                {formatDate(p.period_start)} – {formatDate(p.period_end)}
              </td>
              <td className="px-4 py-3">{formatCurrency(Number(p.base_salary))}</td>
              <td className="px-4 py-3">{formatCurrency(Number(p.overtime_pay))}</td>
              <td className="px-4 py-3">{formatCurrency(Number(p.deductions))}</td>
              <td className="px-4 py-3 font-medium">{formatCurrency(Number(p.net_salary))}</td>
              <td className="px-4 py-3">{p.status}</td>
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
