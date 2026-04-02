'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createReview(formData: FormData) {
  const supabase = await createClient();

  const employee_id = formData.get('employee_id') as string;
  const score = parseFloat(formData.get('score') as string);
  const review_period_start = formData.get('review_period_start') as string;
  const review_period_end = formData.get('review_period_end') as string;
  const notes = formData.get('notes') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const { error } = await supabase.from('performance_reviews').insert({
    employee_id,
    score: Math.round(score),
    review_period_start,
    review_period_end,
    notes,
    reviewer_id: user.id,
  });

  if (error) {
    console.error('Error creating performance review:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/performance');
  return { success: true };
}
