import { createClient } from '@/lib/supabase/server';
import { TimesheetView } from './timesheet-view';

export default async function TimesheetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: myEmployee } = user
    ? await supabase.from('employees').select('id').eq('user_id', user.id).single()
    : { data: null };

  const { data: timesheets } = myEmployee
    ? await supabase
        .from('timesheets')
        .select('*')
        .eq('employee_id', myEmployee.id)
        .order('work_date', { ascending: false })
        .limit(60)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheet</h1>
        <p className="text-muted-foreground">Working hours and overtime</p>
      </div>
      <TimesheetView timesheets={timesheets ?? []} employeeId={myEmployee?.id} />
    </div>
  );
}
