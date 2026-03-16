'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LeavesChartProps {
  data: { name: string; count: number }[];
}

const COLORS: Record<string, string> = {
  annual: '#10b981',
  sick: '#38bdf8',
  unpaid: '#f97316',
  maternity: '#ec4899',
  paternity: '#8b5cf6',
  emergency: '#ef4444',
  other: '#94a3b8',
};

const FALLBACK_COLORS = ['#10b981', '#38bdf8', '#f97316', '#ec4899', '#8b5cf6', '#ef4444', '#94a3b8'];

export function LeavesChart({ data }: LeavesChartProps) {
  const filtered = data.filter(d => d.count > 0);
  const total = filtered.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-foreground">Leave Breakdown</h3>
        <p className="text-xs text-muted-foreground mt-0.5">All types — last 6 months</p>
      </div>

      <div className="flex-1 min-h-[240px] flex items-center justify-center relative">
        {filtered.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered}
                cx="50%"
                cy="45%"
                innerRadius="42%"
                outerRadius="68%"
                paddingAngle={3}
                dataKey="count"
                nameKey="name"
                stroke="none"
              >
                {filtered.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name.toLowerCase()] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                formatter={(v: number, name: string) => [v, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value: string) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">No leave data</div>
        )}

        {/* Center total */}
        {filtered.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: '-12%' }}>
            <span className="text-2xl font-bold text-foreground tabular-nums">{total}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">Total</span>
          </div>
        )}
      </div>
    </div>
  );
}
