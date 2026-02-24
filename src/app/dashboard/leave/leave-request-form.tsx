'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { leaveSchema, type LeaveFormValues } from '@/lib/validations/leave';
import { createClient } from '@/lib/supabase/client';

export function LeaveRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  async function onSubmit(values: LeaveFormValues) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: me } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();
    if (!me) {
      setError('Employee record not found');
      setLoading(false);
      return;
    }
    const { error: e } = await supabase.from('leaves').insert({
      employee_id: me.id,
      leave_type: values.leave_type,
      start_date: values.start_date,
      end_date: values.end_date,
      reason: values.reason || null,
      status: 'pending',
    });
    if (e) {
      setError(e.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.refresh();
    onSuccess?.();
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
      )}
      <div className="space-y-2">
        <Label>Leave type</Label>
        <Select
          value={form.watch('leave_type')}
          onValueChange={(v) => form.setValue('leave_type', v as LeaveFormValues['leave_type'])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="annual">Annual</SelectItem>
            <SelectItem value="sick">Sick</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start date</Label>
          <Input type="date" {...form.register('start_date')} />
          {form.formState.errors.start_date && (
            <p className="text-sm text-destructive">{form.formState.errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>End date</Label>
          <Input type="date" {...form.register('end_date')} />
          {form.formState.errors.end_date && (
            <p className="text-sm text-destructive">{form.formState.errors.end_date.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Reason (optional)</Label>
        <Input {...form.register('reason')} placeholder="Reason for leave" />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
}
