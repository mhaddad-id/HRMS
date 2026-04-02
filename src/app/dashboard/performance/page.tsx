import { createClient } from '@/lib/supabase/server';
import { PerformanceClient } from './performance-client';
import { Activity } from 'lucide-react';

export default async function PerformancePage() {
  const supabase = await createClient();

  // Fetch reviews with employee details
  const { data: reviews } = await supabase
    .from('performance_reviews')
    .select('*, employee:employees(id, first_name, last_name, position, profile_photo_url, office:offices(name))')
    .order('created_at', { ascending: false });


  // Fetch active employees for the creation dialog
  const { data: employees } = await supabase
    .from('employees')
    .select('id, first_name, last_name, position')
    .eq('status', 'active')
    .order('first_name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-200/50 rounded-lg">
          <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent italic">Performance Center</h1>
          <p className="text-muted-foreground">Strategic evaluation and growth tracking</p>
        </div>
      </div>

      <PerformanceClient
        reviews={reviews ?? []}
        employees={employees ?? []}
      />
    </div>
  );
}
