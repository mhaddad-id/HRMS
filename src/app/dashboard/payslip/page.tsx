import { createClient } from '@/lib/supabase/server';
import { getMonthlyPayrollData } from '@/lib/payroll-utils';
import { FileText } from 'lucide-react';
import { redirect } from 'next/navigation';
import { PayslipClient } from './payslip-client';

export default async function PayslipPage({
  searchParams,
}: {
  searchParams: Promise<{ employeeId?: string; month?: string }>;
}) {
  const { employeeId: paramEmployeeId, month: rawMonth } = await searchParams;
  const month = rawMonth || new Date().toISOString().slice(0, 7);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile for role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdminOrHR = profile?.role === 'admin' || profile?.role === 'hr_manager';

  // If not admin/hr, they can only see their own payslip
  let targetEmployeeId = paramEmployeeId;

  const { data: currentEmployee } = await supabase
    .from('employees')
    .select('id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!isAdminOrHR) {
    if (!currentEmployee) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <FileText className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
          <h2 className="text-xl font-bold">No Employee Profile Found</h2>
          <p className="text-muted-foreground">Please contact HR to set up your employee record.</p>
        </div>
      );
    }
    targetEmployeeId = currentEmployee.id;
  }

  // Fetch payroll data for the month
  const { rows: allPayrollData } = await getMonthlyPayrollData(supabase, month);

  // Security: Filter data if not admin/hr
  const payrollsToShow = isAdminOrHR
    ? allPayrollData
    : allPayrollData.filter(p => p.id === currentEmployee?.id);

  // Fetch employees list for admin/hr search
  let employeesList: { id: string; first_name: string; last_name: string; position: string }[] = [];
  if (isAdminOrHR) {
    const { data: emps } = await supabase
      .from('employees')
      .select('id, first_name, last_name, position')
      .eq('status', 'active')
      .order('first_name');
    employeesList = emps || [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-200/50 rounded-lg">
          <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Employee Payslips</h1>
          <p className="text-muted-foreground">View and print official payment documents</p>
        </div>
      </div>

      <PayslipClient
        allPayrolls={payrollsToShow as any}
        employeesList={employeesList}
        isAdminOrHR={isAdminOrHR}
        currentMonth={month}
        initialEmployeeId={targetEmployeeId}
        currentUserEmployeeId={currentEmployee?.id}
      />
    </div>
  );
}
