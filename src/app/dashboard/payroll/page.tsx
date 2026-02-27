import { createClient } from '@/lib/supabase/server';
import { PayrollTable } from './payroll-table';

export default async function PayrollPage() {
  const supabase = await createClient();
  const { data: payrolls } = await supabase
    .from('payroll')
    .select(
      '*, employee:employees(id, first_name, last_name, employee_code, email, supervisor, position, salary)'
    )
    .order('period_start', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">Salary and payroll history</p>
      </div>
      <PayrollTable payrolls={payrolls ?? []} />
    </div>
  );
}
