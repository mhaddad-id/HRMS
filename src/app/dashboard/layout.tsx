import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile_info } = await supabase
    .from('users')
    .select('role, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: employee } = await supabase
    .from('employees')
    .select('first_name, last_name, profile_photo_url')
    .eq('user_id', user.id)
    .single();

  const fullName = employee
    ? `${employee.first_name} ${employee.last_name}`
    : (profile_info?.full_name || user.email || 'User');

  const avatarUrl = employee?.profile_photo_url || profile_info?.avatar_url;

  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email ?? '',
        role: profile_info?.role ?? null,
        full_name: fullName,
        avatar_url: avatarUrl,
      }}
    >
      {children}
    </DashboardShell>
  );
}
