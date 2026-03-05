import { createClient } from '@/lib/supabase/server';
import { PayrollTable } from './payroll-table';

export default async function PayrollPage() {
  const supabase = await createClient();
  const { data: payrolls } = await supabase
    .from('payroll')
<<<<<<< HEAD
    .select('*, employee:employees(id, first_name, last_name, employee_code, office)')
=======
    .select(
      '*, employee:employees(id, first_name, last_name, employee_code, email, supervisor, position, salary)'
    )
>>>>>>> ed09a8c8d317c37da0c13002591a04ddc6231cd2
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
