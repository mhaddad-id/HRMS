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
  const rawOffice = typeof searchParams?.office === 'string' ? searchParams.office : undefined;

  const { data: myEmployee } = user
    ? await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_code, status, office_id')
      .eq('user_id', user.id)
      .single()
    : { data: null };

  const canPickAnyEmployee = role === 'admin' || role === 'hr_manager';

  let allowedOffices: { office_id: string; name: string }[] = [];
  if (canPickAnyEmployee) {
    const { data: allOffices } = await supabase.from('offices').select('id, name').order('name');
    allowedOffices = (allOffices ?? []).map((o: any) => ({ office_id: o.id, name: o.name }));
  } else if (user) {
    const { data: access } = await supabase
      .from('office_access')
      .select('office_id, offices(id, name)')
      .eq('user_id', user.id);
    allowedOffices = (access ?? [])
      .map((a: any) => ({ office_id: a.office_id, name: a.offices?.name }))
      .filter((a) => a.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const { data: employeeOptions } = await (async () => {
    let query = supabase
      .from('employees')
      .select('id, first_name, last_name, employee_code, status')
      .order('created_at', { ascending: false });

    if (!canPickAnyEmployee) {
      if (allowedOffices.length > 0) {
        const officeIds = allowedOffices.map(o => o.office_id);
        query = query.in('office_id', officeIds);
      } else {
        return { data: myEmployee && (!rawOffice || myEmployee.office_id === rawOffice) ? [myEmployee] : [], error: null };
      }
    }

    if (rawOffice) {
      query = query.eq('office_id', rawOffice);
    }

    const { data: emps, error } = await query;
    const finalEmps = emps ?? [];
    
    // Ensure myEmployee is in the list if not already there, and if they match the office filter
    if (!canPickAnyEmployee && myEmployee && !finalEmps.find(e => e.id === myEmployee.id)) {
      if (!rawOffice || myEmployee.office_id === rawOffice) {
        finalEmps.push(myEmployee);
      }
    }
    return { data: finalEmps, error };
  })();

  const selectedEmployeeId =
    employeeOptions?.find(e => e.id === rawEmployee)?.id ??
    (myEmployee?.id ?? employeeOptions?.[0]?.id);

  const [yStr, mStr] = month.split('-');
  const year = Number(yStr);
  const monthIndex = Math.max(0, Math.min(11, Number(mStr) - 1));
  const start = `${month}-01`;
  const end = new Date(Date.UTC(year, monthIndex + 1, 0)).toISOString().slice(0, 10);

  const { data: employee } = selectedEmployeeId
    ? await supabase
      .from('employees')
      .select('employee_code, first_name, last_name, position, office, supervisor, status, ending_date')
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
        officeId={rawOffice}
        offices={allowedOffices}
        employees={
          (employeeOptions ?? []).map((e) => ({
            id: e.id,
            label:
              `${e.first_name ?? ''} ${e.last_name ?? ''}`.trim() ||
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
