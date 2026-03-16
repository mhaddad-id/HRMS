'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PayrollChartProps {
  data: { month: string; total: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
        <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-600">
          ${Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function PayrollChart({ data }: PayrollChartProps) {
  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.total)) : 0;
  const avg = data.length > 0 ? data.reduce((s, d) => s + d.total, 0) / data.length : 0;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Team Payroll</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 6 months trend</p>
        </div>
        {data.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Avg / month</p>
            <p className="text-sm font-bold text-foreground">${Math.round(avg).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="h-[280px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="payrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickMargin={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tickMargin={8}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {avg > 0 && (
                <ReferenceLine
                  y={avg}
                  stroke="#10b981"
                  strokeDasharray="6 3"
                  strokeOpacity={0.4}
                  label={{ value: 'Avg', position: 'right', fontSize: 10, fill: '#10b981' }}
                />
              )}
              <Area
                type="monotone"
                dataKey="total"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#payrollGradient)"
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No payroll data for the last 6 months
          </div>
        )}
      </div>
    </div>
  );
}
