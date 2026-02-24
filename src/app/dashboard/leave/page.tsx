import { createClient } from '@/lib/supabase/server';
import { LeaveList } from './leave-list';
import { RequestLeaveButton } from './request-leave-button';

export default async function LeavePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single();
  const isHR = profile?.role === 'admin' || profile?.role === 'hr_manager';

  const { data: myEmployee } = user
    ? await supabase.from('employees').select('id').eq('user_id', user.id).single()
    : { data: null };

  const query = supabase
    .from('leaves')
    .select('*, employee:employees(id, first_name, last_name, employee_code)')
    .order('created_at', { ascending: false });

  if (!isHR && myEmployee) {
    query.eq('employee_id', myEmployee.id);
  }
  const { data: leaves } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Request and manage leave</p>
        </div>
        {myEmployee && <RequestLeaveButton />}
      </div>
      <LeaveList leaves={leaves ?? []} isHR={isHR} />
    </div>
  );
}
