import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { LeaveList } from './leave-list';
import { RequestLeaveButton } from './request-leave-button';
import { LeaveControls } from './leave-controls';

export default async function LeavePage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const {
    data: authData,
  } = await supabase.auth.getUser();
  const user = authData?.user;

  const { data: profile } = user
    ? await supabase.from('users').select('role').eq('id', user.id).single()
    : { data: null };
  const isHR = profile?.role === 'admin' || profile?.role === 'hr_manager';
  let { data: myEmployee } = user
    ? await supabase.from('employees').select('id, user_id, email, office_id, office').eq('user_id', user.id).single()
    : { data: null };

  if (!myEmployee && user?.email) {
    const { data: byEmail } = await supabase.from('employees').select('id, user_id, email, office_id, office').eq('email', user.email).single();
    if (byEmail) myEmployee = byEmail;
  }

  let allowedOffices: { id: string; name: string }[] = [];

  if (isHR) {
    const { data: allOffices } = await supabase.from('offices').select('id, name').order('name');
    allowedOffices = allOffices ?? [];
  } else if (user) {
    const { data: access } = await supabase
      .from('office_access')
      .select('office_id, offices(id, name)')
      .eq('user_id', user.id);
    allowedOffices = (access ?? [])
      .map((a: any) => a.offices)
      .filter(Boolean)
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }

  const rawOffice = typeof searchParams?.office === 'string' ? searchParams.office : (allowedOffices.length > 0 ? 'all' : undefined);

  const query = supabase
    .from('leaves')
    .select('*, employee:employees!inner(id, first_name, last_name, employee_code, office:offices(id, name), office_id, supervisor_id, supervisor_record:supervisor_id(id, first_name, last_name))')
    .order('created_at', { ascending: false });

  if (allowedOffices.length > 0 && !rawOffice) {
    // Force the user to select an office first
    query.eq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to return empty
  }

  if (!isHR) {
    let allowedEmployeeIds: string[] = [];
    if (allowedOffices.length > 0) {
      const officeIds = allowedOffices.map(o => o.id);

      // FIX: Also get all employees for all allowed offices, so the permitted user can see them
      const { data: emps } = await supabase.from('employees').select('id').in('office_id', officeIds);
      allowedEmployeeIds = (emps ?? []).map(e => e.id);
    }

    // Include subordinates
    if (myEmployee) {
      const { data: subordinates } = await supabase
        .from('employees')
        .select('id')
        .eq('supervisor_id', myEmployee.id);

      const subIds = (subordinates ?? []).map(s => s.id);
      subIds.forEach(id => {
        if (!allowedEmployeeIds.includes(id)) allowedEmployeeIds.push(id);
      });
    }

    // Always include the current employee so they can see their own leaves
    if (myEmployee && !allowedEmployeeIds.includes(myEmployee.id)) {
      allowedEmployeeIds.push(myEmployee.id);
    }

    if (allowedEmployeeIds.length > 0) {
      query.in('employee_id', allowedEmployeeIds);
    } else {
      query.eq('employee_id', myEmployee?.id);
    }
  }

  if (rawOffice && rawOffice !== 'all') {
    query.eq('employee.office_id', rawOffice);
  }

  const { data: leaves, error } = await query;

  if (error) {
    console.error('Leave query error:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Request and manage leave</p>
        </div>
        <div className="flex items-center gap-3">
          {allowedOffices.length > 0 && (
            <Suspense fallback={<div>Loading...</div>}>
              <LeaveControls officeId={rawOffice} offices={allowedOffices} />
            </Suspense>
          )}
          {myEmployee && <RequestLeaveButton />}
        </div>
      </div>
      <LeaveList
        leaves={leaves ?? []}
        isHR={isHR || allowedOffices.length > 0}
        canApprove={isHR}
        userRole={profile?.role || 'employee'}
        currentEmployeeId={myEmployee?.id}
        requiresOfficeSelection={allowedOffices.length > 0 && !rawOffice}
      />
    </div>
  );
}
