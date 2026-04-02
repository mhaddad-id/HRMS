'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPassword } from '@/app/actions/profile';
import { useToast } from '@/hooks/use-toast';

export function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setLoading(true);
    setError(null);

    const res = await resetPassword(formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      toast({
        title: 'Success',
        description: 'Password reset successfully.',
      });
      const form = document.getElementById('reset-password-form') as HTMLFormElement;
      if (form) form.reset();
      router.refresh();
    }
  }

  return (
    <form id="reset-password-form" action={action} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            placeholder="Enter your current password"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="min-w-[140px]">
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
}
