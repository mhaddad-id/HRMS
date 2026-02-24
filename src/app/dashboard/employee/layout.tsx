import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function EmployeeDashboardLayout({
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

  if (profile?.role !== 'employee' && profile?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return children;
}

