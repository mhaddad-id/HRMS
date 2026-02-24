import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { formatCurrency } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

  const [
    { count: totalEmployees },
    { data: pendingLeaves },
    { data: payrollSummary },
    { data: timesheets },
  ] = await Promise.all([
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leaves').select('id').eq('status', 'pending'),
    supabase.from('payroll').select('net_salary, period_start').gte('period_start', startOfMonth),
    supabase.from('timesheets').select('regular_hours, overtime_hours').gte('work_date', startOfMonth),
  ]);

  const pendingCount = pendingLeaves?.length ?? 0;
  const payrollTotal = payrollSummary?.reduce((s, p) => s + Number(p.net_salary), 0) ?? 0;
  const totalRegular = timesheets?.reduce((s, t) => s + Number(t.regular_hours), 0) ?? 0;
  const totalOvertime = timesheets?.reduce((s, t) => s + Number(t.overtime_hours), 0) ?? 0;
  const avgHours =
    timesheets && timesheets.length > 0
      ? (totalRegular + totalOvertime) / timesheets.length
      : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Organization-wide overview</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(payrollTotal)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Per day this month</p>
          </CardContent>
        </Card>
      </div>
      <DashboardCharts />
    </div>
  );
}

