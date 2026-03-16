import { createClient } from '@/lib/supabase/server';

/**
 * Calculates the total payroll amount for a given month (YYYY-MM)
 * using the same logic as the payroll worksheet page:
 *   amount = salary - (salary / 30) * unpaid_leave_days
 */
export async function getPayrollTotalForMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  month: string // YYYY-MM
): Promise<number> {
  const [year, monthNum] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const endDate = new Date(Date.UTC(year!, monthNum!, 0)).toISOString().slice(0, 10);

  // Fetch active employees with salary
  const { data: employees } = await supabase
    .from('employees')
    .select('id, salary')
    .eq('status', 'active');

  if (!employees || employees.length === 0) return 0;

  const employeeIds = employees.map(e => e.id);

  // Fetch unpaid approved leaves in this month
  const { data: leaves } = await supabase
    .from('leaves')
    .select('employee_id, start_date, end_date')
    .in('employee_id', employeeIds)
    .eq('leave_type', 'unpaid')
    .eq('status', 'approved')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  // Calculate total amount for all employees
  let total = 0;
  for (const emp of employees) {
    const empLeaves = (leaves || []).filter(l => l.employee_id === emp.id);
    let lwpDays = 0;
    for (const l of empLeaves) {
      const start = new Date(Math.max(new Date(l.start_date).getTime(), new Date(startDate).getTime()));
      const end = new Date(Math.min(new Date(l.end_date).getTime(), new Date(endDate).getTime()));
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      lwpDays += diffDays;
    }
    const salary = Number(emp.salary || 0);
    const deduction = (salary / 30) * lwpDays;
    total += salary - deduction;
  }

  return total;
}
