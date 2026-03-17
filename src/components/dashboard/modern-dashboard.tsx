import { Card } from "@/components/ui/card";
import { CalendarPlus, Briefcase, Users, BadgeCheck, Star, HeartPulse, Activity } from "lucide-react";
import { PayrollChart } from "./payroll-chart";
import { LeavesChart } from "./leaves-chart";
import Image from "next/image";

export interface ModernDashboardProps {
  /** The logged-in admin/HR user's linked employee record */
  profile: {
    fullName: string;
    code: string;
    position: string;
    supervisor: string | null;
    department: string | null;
    avatarUrl: string | null;
    annualScore: number;
    sickScore: number;
    competenceScore: number;
  } | null;
  payrollByMonth: { month: string; total: number }[];
  leavesByType: { name: string; count: number }[];
  events: {
    title: string;
    type: string;
    time: string;
    date: string;
  }[];
  birthdays: {
    name: string;
    role: string;
    date: string;
    avatarUrl?: string | null;
  }[];
}

export function ModernDashboard({
  profile,
  payrollByMonth,
  leavesByType,
  events,
  birthdays,
}: ModernDashboardProps) {
  const initials = profile
    ? profile.fullName.split(' ').map(n => n.charAt(0)).slice(0, 2).join('')
    : '?';

  return (
    <div className="space-y-6 sm:p-4 p-0">
      {/* Top Row: Profile + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="rounded-2xl p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="h-24 w-24 rounded-full overflow-hidden relative border-4 border-emerald-100 dark:border-emerald-900 shadow-md">
            {profile?.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={profile.fullName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-2xl">
                {initials}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">{profile?.fullName ?? 'Admin'}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 font-mono">{profile?.code ?? '—'}</p>
          </div>

          <div className="w-full border-t border-border" />

          <div className="w-full space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                <Briefcase size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Position</p>
                <p className="text-sm font-semibold text-foreground">{profile?.position ?? '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                <Users size={15} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Supervisor</p>
                <p className="text-sm font-semibold text-foreground">{profile?.supervisor ?? 'Not assigned'}</p>
              </div>
            </div>

            {profile?.department && (
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center">
                  <BadgeCheck size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Department</p>
                  <p className="text-sm font-semibold text-foreground">{profile.department}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Scores Card */}
        <Card className="rounded-2xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-5">Leave Scores</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Annual */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Annual</span>
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center">
                  <Star size={15} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(profile?.annualScore ?? 0).toFixed(3)}
              </div>
              <div className="w-full bg-emerald-100 dark:bg-emerald-900/40 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (Number(profile?.annualScore ?? 0) / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Annual leave balance</p>
            </div>

            {/* Sick */}
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sick</span>
                <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center">
                  <HeartPulse size={15} className="text-sky-600 dark:text-sky-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(profile?.sickScore ?? 0).toFixed(3)}
              </div>
              <div className="w-full bg-sky-100 dark:bg-sky-900/40 rounded-full h-1.5">
                <div
                  className="bg-sky-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (Number(profile?.sickScore ?? 0) / 15) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Sick leave balance</p>
            </div>

            {/* Compensation */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Compensation</span>
                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center">
                  <Activity size={15} className="text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums">
                {Number(profile?.competenceScore ?? 0).toFixed(3)}
              </div>
              <div className="w-full bg-violet-100 dark:bg-violet-900/40 rounded-full h-1.5">
                <div
                  className="bg-violet-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (Number(profile?.competenceScore ?? 0) / 10) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Compensation score</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row: Payroll + Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PayrollChart data={payrollByMonth} />
        </div>
        <div className="lg:col-span-1">
          <LeavesChart data={leavesByType} />
        </div>
      </div>

      {/* Bottom Row: Events + Birthdays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Events and Meetings</h3>
            <button className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-md font-medium flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition">
              <CalendarPlus size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {events.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0 h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground border">
                  <CalendarPlus size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground leading-tight truncate">{evt.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{evt.type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-foreground">{evt.time}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{evt.date}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No upcoming events.</div>
            )}
          </div>
        </div>

        {/* Birthdays */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-foreground">Birthdays</h3>
            <span className="text-xs border px-3 py-1.5 rounded-md text-muted-foreground bg-muted/50">
              This month
            </span>
          </div>
          <div className="space-y-4">
            {birthdays.map((bday, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden relative border border-border shadow-sm flex-shrink-0">
                  {bday.avatarUrl ? (
                    <Image src={bday.avatarUrl} alt={bday.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                      {bday.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground leading-tight truncate">{bday.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{bday.role}</p>
                </div>
                <div className="text-[11px] text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md border flex-shrink-0">
                  {bday.date}
                </div>
              </div>
            ))}
            {birthdays.length === 0 && (
              <div className="text-center py-6 text-xs text-muted-foreground">No birthdays this month.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
