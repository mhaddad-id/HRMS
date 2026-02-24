import Link from 'next/link';
import { RegisterForm } from './register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 selection:bg-primary/20 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
        <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Users className="w-5 h-5" />
        </div>
        <span className="font-semibold text-lg hover:text-primary transition-colors">HRMS</span>
      </Link>

      <Card className="w-full max-w-md shadow-2xl shadow-primary/5 border-border/50">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
            <Users className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Register for a new HRMS workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/40 pt-6 pb-6">
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
