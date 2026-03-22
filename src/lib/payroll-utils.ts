import { createClient } from '@/lib/supabase/server';

export interface PayrollRow {
  id: string;
  employee_code?: string;
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

/**
 * Calculates the detailed payroll data for a given month (YYYY-MM)
 * this is the single source of truth for both the payroll page and dashboard charts.
 */
export async function getMonthlyPayrollData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  month: string, // YYYY-MM
  office?: string
) {
  // Get dates for the month
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const endDate = new Date(Date.UTC(year!, monthNum!, 0)).toISOString().slice(0, 10);

  // 1. Fetch Employees
  let empQuery = supabase
    .from('employees')
    .select('id, employee_code, first_name, last_name, position, salary, currency, office:offices!inner(id, name)')
    .eq('status', 'active');

  if (office && office !== 'all') {
    empQuery = empQuery.eq('office.name', office);
  }

  const { data: employees } = await empQuery;
  if (!employees) return { rows: [], total: 0 };

  const employeeIds = employees.map(e => e.id);

  // 2. Fetch Timesheets and Unpaid Leaves in parallel
  const [{ data: timesheets }, { data: leaves }] = await Promise.all([
    supabase
      .from('timesheets')
      .select('employee_id, work_date')
      .in('employee_id', employeeIds)
      .gte('work_date', startDate)
      .lte('work_date', endDate),
    supabase
      .from('leaves')
      .select('employee_id, start_date, end_date')
      .in('employee_id', employeeIds)
      .eq('leave_type', 'unpaid')
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate)
  ]);

  // 3. Calculate Payroll Data for each employee
  let grandTotal = 0;
  const rows: PayrollRow[] = employees.map(emp => {
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

    const monthDays = new Date(year, monthNum, 0).getDate();
    const workedDaysCount = monthDays - lwpDays;
    const salary = Number(emp.salary || 0);
    const deduction = (salary / 30) * lwpDays;
    const amount = salary - deduction;

    grandTotal += amount;

    return {
      id: emp.id,
      employee_code: emp.employee_code,
      name: `${emp.first_name} ${emp.last_name}`,
      position: emp.position,
      worked_days: workedDaysCount,
      lwp: lwpDays,
      salary: salary,
      deduction: deduction,
      currency: emp.currency || 'USD',
      amount: amount,
      office_name: (emp.office as any)?.name
    };
  });

  return { rows, total: grandTotal };
}

/**
 * Legacy wrapper for getMonthlyPayrollData to get just the total
 */
export async function getPayrollTotalForMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  month: string
): Promise<number> {
  const { total } = await getMonthlyPayrollData(supabase, month);
  return total;
}
