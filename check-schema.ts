import { createClient } from './src/lib/supabase/server';

async function checkColumns() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('performance_reviews').select('*').limit(1);
  if (error) {
    console.error('Error fetching performance_reviews:', error);
  } else {
    console.log('Performance Review Columns:', Object.keys(data[0] || {}));
  }
}

checkColumns();
