import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Briefcase, Calendar, BarChart3, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20">
      {/* Navbar */}
      <header className="px-6 relative z-50 py-4 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary p-2 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">HRMS Core</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-24 sm:py-32 flex flex-col items-center justify-center text-center px-4">
          {/* Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] opacity-50 pointer-events-none" />

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground shadow-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Modern HR Management for SMEs
            </div>

            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Manage your team <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-ring">
                with flawless ease
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Empower your HR department with an all-in-one system for employee records, leave requests, timesheets, and payroll management.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20 gap-2 font-semibold text-lg" asChild>
                <Link href="/register">
                  Start for free <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold text-lg" asChild>
                <Link href="/login">Sign in to workspace</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card/50 border-t border-border/40 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Everything you need to thrive</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Built from the ground up for modern businesses, providing complete visibility and control over your human resources.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Briefcase className="w-6 h-6 text-primary" />}
                title="Employee Directory"
                description="Securely store and manage employee records, roles, and department structures in one place."
              />
              <FeatureCard
                icon={<Calendar className="w-6 h-6 text-primary" />}
                title="Leave & Time-off"
                description="Streamline request approvals and track sick, annual, and unpaid leave automatically."
              />
              <FeatureCard
                icon={<Clock className="w-6 h-6 text-primary" />}
                title="Timesheets"
                description="Employees can easily log work hours and overtime, letting HR keep exact records."
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6 text-primary" />}
                title="Payroll Tracking"
                description="Calculate monthly salaries and view comprehensive payroll history at a glance."
              />
              <FeatureCard
                icon={<Users className="w-6 h-6 text-primary" />}
                title="Performance"
                description="Monitor employee growth with integrated performance reviews and scoring."
              />
              <FeatureCard
                icon={<ArrowRight className="w-6 h-6 text-primary" />}
                title="Role-Based Security"
                description="Built on Enterprise-grade RBAC, keeping sensitive data strictly protected."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/40 bg-background text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} HRMS Thesis Project. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="border border-border/50 bg-background shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/20 group">
      <CardContent className="p-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
