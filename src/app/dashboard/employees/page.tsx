import { createClient } from '@/lib/supabase/server';
import { Users } from 'lucide-react';
import { EmployeesTable } from './employees-table';
import { AddEmployeeButton } from './add-employee-button';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase
    .from('employees')
    .select('*, supervisor_record:supervisor_id(id, first_name, last_name, profile_photo_url), office:offices(id, name)')
    .order('created_at', { ascending: false });

  const { data: offices } = await supabase
    .from('offices')
    .select('id, name')
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-200/50 dark:bg-emerald-200/10 rounded-lg">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Employees</h1>
            <p className="text-muted-foreground">Manage employee records</p>
          </div>
        </div>
        <AddEmployeeButton employees={employees ?? []} />
      </div>
      <EmployeesTable employees={employees ?? []} allOffices={offices ?? []} />
    </div>
  );
}
