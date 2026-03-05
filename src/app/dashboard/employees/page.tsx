import { createClient } from '@/lib/supabase/server';
import { EmployeesTable } from './employees-table';
import { AddEmployeeButton } from './add-employee-button';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from('employees')
    .select('*, supervisor:employees!supervisor_id(id, first_name, last_name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage employee records</p>
        </div>
        <AddEmployeeButton employees={employees ?? []} />
      </div>
      <EmployeesTable employees={employees ?? []} />
    </div>
  );
}
