import Link from 'next/link';
import { SignInForm } from './sign-in-form';
import { LoginMessages } from './login-messages';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const { error, message } = searchParams;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 selection:bg-primary/20 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8">
        <Logo size={24} />
      </Link>

      <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <Logo size={40} showText={false} className="mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Sign in to your HR management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginMessages error={error} message={message} />
          <SignInForm />
        </CardContent>
      </Card>
    </div>
  );
}
