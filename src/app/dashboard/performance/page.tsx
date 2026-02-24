import { createClient } from '@/lib/supabase/server';
import { PerformanceTable } from './performance-table';

export default async function PerformancePage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from('performance_reviews')
    .select('*, employee:employees(id, first_name, last_name)')
    .order('review_period_end', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance</h1>
        <p className="text-muted-foreground">Reviews and evaluations</p>
      </div>
      <PerformanceTable reviews={reviews ?? []} />
    </div>
  );
}
