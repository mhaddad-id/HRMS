import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function HrDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'hr_manager' && profile?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return children;
}

