'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', '#22c55e', '#eab308', '#ef4444'];

export function DashboardCharts() {
  const [payrollByMonth, setPayrollByMonth] = useState<{ month: string; total: number }[]>([]);
  const [leaveByType, setLeaveByType] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const from = new Date();
    from.setMonth(from.getMonth() - 5);
    const fromStr = from.toISOString().slice(0, 10);

    Promise.all([
      supabase
        .from('payroll')
        .select('period_start, net_salary')
        .gte('period_start', fromStr),
      supabase.from('leaves').select('leave_type').in('status', ['approved', 'pending']),
    ]).then(([payRes, leaveRes]) => {
      const payroll = payRes.data ?? [];
      const byMonth: Record<string, number> = {};
      payroll.forEach((p) => {
        const key = p.period_start.slice(0, 7);
        byMonth[key] = (byMonth[key] ?? 0) + Number(p.net_salary);
      });
      setPayrollByMonth(
        Object.entries(byMonth)
          .map(([month, total]) => ({ month, total }))
          .sort((a, b) => a.month.localeCompare(b.month))
      );

      const leaves = leaveRes.data ?? [];
      const byType: Record<string, number> = {};
      leaves.forEach((l) => {
        byType[l.leave_type] = (byType[l.leave_type] ?? 0) + 1;
      });
      setLeaveByType(
        Object.entries(byType).map(([name, value]) => ({ name, value }))
      );
    });
  }, []);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 font-semibold">Payroll by Month</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollByMonth}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Total']} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 font-semibold">Leaves by Type</h3>
        <div className="h-[300px]">
          {leaveByType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {leaveByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No leave data yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
