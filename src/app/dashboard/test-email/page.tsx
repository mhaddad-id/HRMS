'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendWelcomeEmail } from '@/app/actions/emails';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result = await sendWelcomeEmail({
        to: email,
        firstName: 'Test User',
        employeeCode: 'TEST-001',
      });

      if (result.success) {
        toast({
          title: 'Email Sent!',
          description: `Check your inbox (${email}) for the welcome email.`,
        });
      } else {
        toast({
          title: 'Error',
          description: (result.error as any)?.message || 'Failed to send email. Check your API key.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Unexpected Error',
        description: 'Something went wrong while sending the email.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold uppercase tracking-wider text-emerald-600">Testing Tools</span>
          </div>
          <CardTitle>Email Integration Test</CardTitle>
          <CardDescription>
            Send a sample "Welcome Email" to verify your Resend integration is working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendTest} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Recipient Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-emerald-100 focus:border-emerald-500"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Note: Use the email you registered with Resend if your domain is not verified.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={loading || !email}
            >
              {loading ? 'Sending...' : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Test Email
                </span>
              )}
            </Button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              What this tests:
            </h4>
            <ul className="text-xs text-slate-500 space-y-1 ml-6 list-disc">
              <li>Resend API Key authentication</li>
              <li>React Email template rendering</li>
              <li>Next.js Server Action execution</li>
              <li>Network connectivity to Resend</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
