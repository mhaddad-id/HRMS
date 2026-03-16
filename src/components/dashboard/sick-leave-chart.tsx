'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SickLeaveChartProps {
  data: { month: string; count: number }[];
}

const COLORS = ['#38bdf8', '#0ea5e9', '#7dd3fc', '#bae6fd', '#e0f2fe', '#0284c7'];

export function SickLeaveChart({ data }: SickLeaveChartProps) {
  const filtered = data.filter(d => d.count > 0);
  const total = filtered.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">Sick Leave</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Requests by month</p>
      </div>

      <div className="flex-1 min-h-[240px] flex items-center justify-center relative">
        {filtered.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered}
                cx="50%"
                cy="45%"
                innerRadius="45%"
                outerRadius="70%"
                paddingAngle={3}
                dataKey="count"
                nameKey="month"
                stroke="none"
              >
                {filtered.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
                formatter={(v: number) => [v, 'Requests']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            No sick leave data
          </div>
        )}

        {/* Center label */}
        {filtered.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-8%' }}>
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Total</span>
          </div>
        )}
      </div>
    </div>
  );
}
