import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import {
  User,
  BadgeCheck,
  Briefcase,
  Users,
  CalendarDays,
  CalendarHeart,
  Star,
  Activity,
  HeartPulse,
} from 'lucide-react';

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch the logged-in user's linked employee record
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const now = new Date();

  // If no employee record linked, show a friendly message
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <User size={64} className="text-muted-foreground opacity-30" />
        <h2 className="text-2xl font-bold text-foreground">No Employee Record Found</h2>
        <p className="text-muted-foreground max-w-sm">
          Your account is not linked to an employee record yet. Please contact your HR manager.
        </p>
      </div>
    );
  }

  // Fetch supervisor name
  let supervisorName: string | null = null;
  if (employee.supervisor_id) {
    const { data: sup } = await supabase
      .from('employees')
      .select('first_name, last_name')
      .eq('id', employee.supervisor_id)
      .single();
    if (sup) supervisorName = `${sup.first_name} ${sup.last_name}`;
  } else if (employee.supervisor) {
    supervisorName = employee.supervisor;
  }

  // Fetch upcoming meetings for this user
  const { data: upcomingMeetings } = await supabase
    .from('meetings')
    .select('id, title, scheduled_at')
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at')
    .limit(5);

  // Fetch all active employees for birthday calculation
  const { data: allEmployees } = await supabase
    .from('employees')
    .select('first_name, last_name, position, date_of_birth, profile_photo_url')
    .eq('status', 'active');

  // Birthdays this month
  const currentMonthIdx = now.getMonth();
  const birthdays = (allEmployees || [])
    .filter(emp => {
      if (!emp.date_of_birth) return false;
      return new Date(emp.date_of_birth).getMonth() === currentMonthIdx;
    })
    .map(emp => {
      const d = new Date(emp.date_of_birth!);
      return {
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.position,
        date: format(new Date(now.getFullYear(), d.getMonth(), d.getDate()), 'dd/MM/yyyy'),
        avatarUrl: emp.profile_photo_url,
      };
    })
    .slice(0, 6);

  const events = (upcomingMeetings || []).map(m => {
    const d = new Date(m.scheduled_at);
    return {
      title: m.title,
      time: format(d, 'h:mm a'),
      date: format(d, 'dd/MM/yyyy'),
    };
  });

  const fullName = `${employee.first_name} ${employee.last_name}`;
  const initials = `${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`;

  return (
    <div className="space-y-6 sm:p-4 p-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back, {employee.first_name}!</p>
      </div>

      {/* Top row: Profile Card + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full overflow-hidden relative border-4 border-emerald-100 dark:border-emerald-900 shadow-md">
            {employee.profile_photo_url ? (
              <Image src={employee.profile_photo_url} alt={fullName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>

          {/* Name & Code */}
          <div>
            <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">{employee.employee_code}</p>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-border" />

          {/* Details */}
          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                <Briefcase size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Position</p>
                <p className="text-sm font-semibold text-foreground">{employee.position}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Supervisor</p>
                <p className="text-sm font-semibold text-foreground">{supervisorName ?? 'Not assigned'}</p>
              </div>
            </div>

            {employee.office && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                  <BadgeCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Department</p>
                  <p className="text-sm font-semibold text-foreground">{employee.office}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Scores Card */}
        <Card className="rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-5">Leave Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Annual Score */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Annual</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                  <Star size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(employee.annual_score).toFixed(3)}
              </div>
              <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (Number(employee.annual_score) / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Annual leave balance</p>
            </div>

            {/* Sick Score */}
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sick</span>
                <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center">
                  <HeartPulse size={15} className="text-sky-600 dark:text-sky-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(employee.sick_score).toFixed(3)}
              </div>
              <div className="w-full bg-sky-100 dark:bg-sky-900/40 rounded-full h-1.5">
                <div
                  className="bg-sky-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (Number(employee.sick_score) / 15) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Sick leave balance</p>
            </div>

            {/* Competence Score */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Compensation</span>
                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
                  <Activity size={15} className="text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(employee.competence_score).toFixed(3)}
              </div>
              <div className="w-full bg-violet-100 dark:bg-violet-900/40 rounded-full h-1.5">
                <div
                  className="bg-violet-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (Number(employee.competence_score) / 10) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Compensation score</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Meetings and Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings */}
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Upcoming Meetings</h3>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
              <CalendarDays size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-4">
            {events.map((evt, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 transition">
                <div className="flex-shrink-0 text-center min-w-[40px]">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{evt.date.slice(3, 5)}/{evt.date.slice(0, 2)}</p>
                  <p className="text-sm font-bold text-foreground">{evt.date.slice(0, 2)}</p>
                </div>
                <div className="w-px h-8 bg-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{evt.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{evt.time}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No upcoming meetings.</div>
            )}
          </div>
        </Card>

        {/* Birthdays */}
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Birthdays This Month</h3>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-900/40 flex items-center justify-center">
              <CalendarHeart size={16} className="text-rose-500 dark:text-rose-400" />
            </div>
          </div>
          <div className="space-y-4">
            {birthdays.map((bday, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden relative border border-border shadow-sm flex-shrink-0">
                  {bday.avatarUrl ? (
                    <Image src={bday.avatarUrl} alt={bday.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 font-bold text-sm">
                      {bday.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{bday.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{bday.role}</p>
                </div>
                <div className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md border flex-shrink-0">
                  {bday.date}
                </div>
              </div>
            ))}
            {birthdays.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">No birthdays this month.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
