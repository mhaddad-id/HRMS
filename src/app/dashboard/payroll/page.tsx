import { createClient } from '@/lib/supabase/server';
import { getMonthlyPayrollData } from '@/lib/payroll-utils';
import { PayrollTable } from './payroll-table';

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ office?: string; month?: string }>;
}) {
  const { office, month: rawMonth } = await searchParams;
  const month = rawMonth || new Date().toISOString().slice(0, 7); // Default to current month YYYY-MM
  const supabase = await createClient();

  // 1. Fetch Payroll Data using the unified logic
  const { rows: payrollData } = await getMonthlyPayrollData(supabase, month, office);

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

