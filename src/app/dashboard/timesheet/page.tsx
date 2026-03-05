import { createClient } from '@/lib/supabase/server';
import { TimesheetView } from './timesheet-view';

export default async function TimesheetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single();
  const isHR = profile?.role === 'admin' || profile?.role === 'hr_manager';

  const { data: myEmployee } = user
    ? await supabase.from('employees').select('id').eq('user_id', user.id).single()
    : { data: null };

  let timesheets;
  if (isHR) {
    const { data } = await supabase
      .from('timesheets')
      .select('*, employee:employees(first_name, last_name, employee_code, office)')
      .order('work_date', { ascending: false })
      .limit(100);
    timesheets = data;
  } else if (myEmployee) {
    const { data } = await supabase
      .from('timesheets')
      .select('*')
      .eq('employee_id', myEmployee.id)
      .order('work_date', { ascending: false })
      .limit(60);
    timesheets = data;
  } else {
    timesheets = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheet</h1>
        <p className="text-muted-foreground">Working hours and overtime</p>
      </div>
      <TimesheetView timesheets={timesheets ?? []} employeeId={myEmployee?.id} isHR={isHR} />
    </div>
  );
}
