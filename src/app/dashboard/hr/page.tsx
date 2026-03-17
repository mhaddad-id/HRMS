import { createClient } from '@/lib/supabase/server';
import { ModernDashboard } from '@/components/dashboard/modern-dashboard';
import { getPayrollTotalForMonth } from '@/lib/payroll-utils';
import { format, subMonths } from 'date-fns';

export default async function HrDashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const sixMonthsAgoStr = subMonths(now, 5).toISOString().slice(0, 10);

  // Get logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch HR manager's linked employee record for profile + scores
  let hrProfile = null;
  if (user) {
    const { data: emp } = await supabase
      .from('employees')
      .select('first_name, last_name, employee_code, position, supervisor, supervisor_id, office, profile_photo_url, annual_score, sick_score, competence_score')
      .eq('user_id', user.id)
      .single();

    if (emp) {
      let supervisorName: string | null = emp.supervisor ?? null;
      if (emp.supervisor_id) {
        const { data: sup } = await supabase
          .from('employees')
          .select('first_name, last_name')
          .eq('id', emp.supervisor_id)
          .single();
        if (sup) supervisorName = `${sup.first_name} ${sup.last_name}`;
      }

      hrProfile = {
        fullName: `${emp.first_name} ${emp.last_name}`,
        code: emp.employee_code,
        position: emp.position,
        supervisor: supervisorName,
        department: emp.office ?? null,
        avatarUrl: emp.profile_photo_url ?? null,
        annualScore: Number(emp.annual_score),
        sickScore: Number(emp.sick_score),
        competenceScore: Number(emp.competence_score),
      };
    }
  }

  // Build payroll totals for last 6 months using same calculation as the payroll page
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i);
    return format(d, 'yyyy-MM');
  });

  const payrollTotals = await Promise.all(
    last6Months.map(month => getPayrollTotalForMonth(supabase, month))
  );

  const payrollByMonth = last6Months.map((month, i) => ({
    month: format(new Date(month + '-01'), 'MMM'),
    total: payrollTotals[i],
  }));

  // Fetch sick leaves and other data in parallel
  const [
    { data: sickLeaves },
    { data: upcomingMeetings },
    { data: employeesForBirthdays },
  ] = await Promise.all([
    supabase.from('leaves').select('leave_type').gte('start_date', sixMonthsAgoStr),
    supabase.from('meetings').select('id, title, scheduled_at').gte('scheduled_at', now.toISOString()).order('scheduled_at').limit(4),
    supabase.from('employees').select('first_name, last_name, position, date_of_birth, profile_photo_url').eq('status', 'active'),
  ]);

  // Leaves by type for the pie chart
  const leafCounts: Record<string, number> = {};
  (sickLeaves || []).forEach(l => {
    const type = l.leave_type;
    leafCounts[type] = (leafCounts[type] || 0) + 1;
  });
  const leavesByType = Object.entries(leafCounts).map(([name, count]) => ({
    name,
    count
  }));

  // Events
  const events = (upcomingMeetings || []).map(m => {
    const d = new Date(m.scheduled_at);
    return { title: m.title, type: 'Meeting', time: format(d, 'h:mm a'), date: format(d, 'dd/MM/yyyy') };
  });

  // Birthdays this month
  const currentMonthIdx = now.getMonth();
  const birthdays = (employeesForBirthdays || [])
    .filter(emp => emp.date_of_birth && new Date(emp.date_of_birth).getMonth() === currentMonthIdx)
    .map(emp => {
      const d = new Date(emp.date_of_birth!);
      return {
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.position,
        date: format(new Date(now.getFullYear(), d.getMonth(), d.getDate()), 'dd/MM/yyyy'),
        avatarUrl: emp.profile_photo_url,
      };
    }).slice(0, 5);

  return (
    <ModernDashboard
      profile={hrProfile}
      payrollByMonth={payrollByMonth}
      leavesByType={leavesByType}
      events={events}
      birthdays={birthdays}
    />
  );
}
