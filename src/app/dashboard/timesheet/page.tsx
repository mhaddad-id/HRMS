import { createClient } from '@/lib/supabase/server';
import { TimesheetControls } from './timesheet-controls';
import { TimesheetReport } from './timesheet-report';

export default async function TimesheetPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('users').select('role').eq('id', user.id).single()
    : { data: null };

  const role = profile?.role ?? 'employee';

  const rawMonth = typeof searchParams?.month === 'string' ? searchParams.month : undefined;
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : new Date().toISOString().slice(0, 7);

  const rawEmployee = typeof searchParams?.employee === 'string' ? searchParams.employee : undefined;

  const { data: myEmployee } = user
    ? await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()
    : { data: null };

  const canPickAnyEmployee = role === 'admin' || role === 'hr_manager';

  const { data: employeeOptions } = canPickAnyEmployee
    ? await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_code, pay_no, status')
        .order('created_at', { ascending: false })
    : { data: myEmployee ? [{ id: myEmployee.id, first_name: '', last_name: '', employee_code: '', pay_no: null, status: 'active' }] : [] };

  const selectedEmployeeId =
    (canPickAnyEmployee ? rawEmployee : undefined) ||
    (myEmployee?.id ?? employeeOptions?.[0]?.id);

  const [yStr, mStr] = month.split('-');
  const year = Number(yStr);
  const monthIndex = Math.max(0, Math.min(11, Number(mStr) - 1));
  const start = `${month}-01`;
  const end = new Date(Date.UTC(year, monthIndex + 1, 0)).toISOString().slice(0, 10);

  const { data: employee } = selectedEmployeeId
    ? await supabase
        .from('employees')
        .select('pay_no, first_name, last_name, position, office, supervisor, status')
        .eq('id', selectedEmployeeId)
        .single()
    : { data: null };

  const { data: timesheets } = selectedEmployeeId
    ? await supabase
        .from('timesheets')
        .select('work_date, clock_in, clock_out, regular_hours, overtime_hours')
        .eq('employee_id', selectedEmployeeId)
        .gte('work_date', start)
        .lte('work_date', end)
        .order('work_date', { ascending: true })
    : { data: [] };

  const { data: leaves } = selectedEmployeeId
    ? await supabase
        .from('leaves')
        .select('leave_type, start_date, end_date, status')
        .eq('employee_id', selectedEmployeeId)
        .lte('start_date', end)
        .gte('end_date', start)
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheet</h1>
        <p className="text-muted-foreground">Monthly timesheet report</p>
      </div>
      <TimesheetControls
        month={month}
        employeeId={selectedEmployeeId}
        employees={
          (employeeOptions ?? []).map((e) => ({
            id: e.id,
            label:
              `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() ||
              e.pay_no ||
              e.employee_code ||
              e.id,
            status: e.status,
          })) as any
        }
        status={(employee as any)?.status ?? null}
      />
      {employee ? (
        <TimesheetReport
          month={month}
          employee={employee as any}
          timesheets={(timesheets ?? []) as any}
          leaves={(leaves ?? []) as any}
        />
      ) : (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          No employee selected.
        </div>
      )}
    </div>
  );
}
