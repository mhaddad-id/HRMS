import { createClient } from '@/lib/supabase/server';
import { PayrollTable } from './payroll-table';

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string; month?: string }>;
}) {
  const { office, month: rawMonth } = await searchParams;
  const month = rawMonth || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
  const supabase = await createClient();

  // Get dates for the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const endDate = new Date(Date.UTC(year!, monthNum!, 0)).toISOString().slice(0, 10);

  // 1. Fetch Employees
  let empQuery = supabase
    .from('employees')
    .select('id, first_name, last_name, position, salary, currency, office:offices!inner(id, name)')
    .eq('status', 'active');

  if (office && office !== 'all') {
    empQuery = empQuery.eq('office.name', office);
  }

  const { data: employees } = await empQuery;

  if (!employees) return <div>Failed to load employees</div>;

  const employeeIds = employees.map(e => e.id);

  // 2. Fetch Timesheets for these employees in the selected month
  const { data: timesheets } = await supabase
    .from('timesheets')
    .select('employee_id, work_date, regular_hours, overtime_hours')
    .in('employee_id', employeeIds)
    .gte('work_date', startDate)
    .lte('work_date', endDate);

  // 3. Fetch Unpaid Leaves for these employees in the selected month
  const { data: leaves } = await supabase
    .from('leaves')
    .select('employee_id, start_date, end_date')
    .in('employee_id', employeeIds)
    .eq('leave_type', 'unpaid')
    .eq('status', 'approved')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  // 4. Calculate Payroll Data for each employee
  const payrollData = employees.map(emp => {
    const empTimesheets = timesheets?.filter(t => t.employee_id === emp.id) || [];
    const empLeaves = leaves?.filter(l => l.employee_id === emp.id) || [];

    // Calculate Unpaid Leave Days (LWP)
    let lwpDays = 0;
    empLeaves.forEach(l => {
      const start = new Date(Math.max(new Date(l.start_date).getTime(), new Date(startDate).getTime()));
      const end = new Date(Math.min(new Date(l.end_date).getTime(), new Date(endDate).getTime()));
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      lwpDays += diffDays;
    });

    // Calculate Worked Days
    // We count days with timesheet entries
    const workedDaysCount = new Set(empTimesheets.map(t => t.work_date)).size;

    const salary = Number(emp.salary || 0);
    const deduction = (salary / 30) * lwpDays;
    const amount = salary - deduction;

    return {
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      position: emp.position,
      worked_days: workedDaysCount,
      lwp: lwpDays,
      deduction: deduction,
      salary: salary,
      currency: emp.currency || 'USD',
      amount: amount,
      office_name: (emp.office as any)?.name
    };
  });

  const { data: officesList } = await supabase
    .from('offices')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Worksheet</h1>
        <p className="text-muted-foreground">Dynamic calculations for {month}</p>
      </div>
      <PayrollTable payrolls={payrollData as any} allOffices={officesList ?? []} currentMonth={month} />
    </div>
  );
}

