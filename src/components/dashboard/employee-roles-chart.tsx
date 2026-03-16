'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface EmployeeRolesChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#e5e7eb'];

export function EmployeeRolesChart({ data }: EmployeeRolesChartProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col h-full">
      <h3 className="mb-4 text-lg font-semibold space-y-1">Total Employee</h3>
      <div className="h-[300px] w-full flex-grow flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', right: 0 }}
                formatter={(value, entry: any) => (
                  <span className="text-muted-foreground ml-1">
                    {value} 
                    <span className="float-right font-medium text-foreground ml-3">{entry.payload.value}</span>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No roles data available
          </div>
        )}
      </div>
    </div>
  );
}
