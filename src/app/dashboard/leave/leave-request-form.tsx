
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
import { submitLeaveRequest } from '@/app/actions/leaves';
import { toast } from '@/hooks/use-toast';

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

  function calculateDays(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    // Set to midnight to avoid time issues
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  async function onSubmit(values: LeaveFormValues) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: me } = await supabase
      .from('employees')
      .select('id, annual_score, sick_score')
      .eq('user_id', user?.id)
      .single();

    if (!me) {
      setError('Employee record not found');
      setLoading(false);
      return;
    }

    const duration = calculateDays(values.start_date, values.end_date);

    if (values.leave_type === 'annual') {
      if ((me.annual_score || 0) < duration) {
        setError(`Insufficient annual leave score. You have ${me.annual_score || 0} days remaining, but requested ${duration} days. You can request unpaid leave instead.`);
        setLoading(false);
        return;
      }
    } else if (values.leave_type === 'sick') {
      if ((me.sick_score || 0) < duration) {
        setError(`Insufficient sick leave score. You have ${me.sick_score || 0} days remaining, but requested ${duration} days.`);
        setLoading(false);
        return;
      }
    }

    const result = await submitLeaveRequest({
      employeeId: me.id,
      leaveType: values.leave_type,
      startDate: values.start_date,
      endDate: values.end_date,
      reason: values.reason || undefined,
    });

    if (!result.success) {
      setError(result.error?.message || 'Failed to submit leave request');
      setLoading(false);
      return;
    }

    toast({
      title: 'Success!',
      description: 'Your leave request has been submitted and notifications sent.',
    });
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
