import { createClient } from '@/lib/supabase/server';
import { EmployeesTable } from './employees-table';
import { AddEmployeeButton } from './add-employee-button';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from('employees')
    .select('*, department:departments(id, name, code)')
    .order('created_at', { ascending: false });

  const { data: departments } = await supabase.from('departments').select('id, name, code').order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage employee records</p>
        </div>
        <AddEmployeeButton departments={departments ?? []} />
      </div>
      <EmployeesTable employees={employees ?? []} departments={departments ?? []} />
    </div>
  );
}
