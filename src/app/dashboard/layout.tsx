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

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email ?? '',
        role: profile?.role ?? null,
        full_name: null,
        avatar_url: null,
      }}
    >
      {children}
    </DashboardShell>
  );
}
