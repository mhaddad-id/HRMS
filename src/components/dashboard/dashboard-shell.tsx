'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  ClipboardList,
  Clock,
  CalendarDays,
  Bell,
  LogOut,
  Moon,
  Sun,
  ChevronRight
} from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/database.types';

interface DashboardShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    full_name?: string | null;
    avatar_url?: string | null;
    role?: UserRole | null;
  };
}

const navItems: { href: string; label: string; icon: React.ElementType; roles?: UserRole[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
  { href: '/dashboard/employees', label: 'Employees', icon: Users, roles: ['admin', 'hr_manager'] },
  { href: '/dashboard/leave', label: 'Leave', icon: Calendar },
  { href: '/dashboard/payroll', label: 'Payroll', icon: DollarSign },
  { href: '/dashboard/performance', label: 'Performance', icon: ClipboardList, roles: ['admin', 'hr_manager'] },
  { href: '/dashboard/timesheet', label: 'Timesheet', icon: Clock },
  { href: '/dashboard/meetings', label: 'Meetings', icon: CalendarDays },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
];

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const role = user.role ?? 'employee';
  const filteredNav = navItems.filter((n) => !n.roles || n.roles.includes(role));

  return (
    <div className="min-h-screen flex bg-background selection:bg-primary/20">
      <aside className="w-[280px] border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col hidden md:flex transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1.5 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            HRMS
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="mb-4 px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Main Menu
          </div>
          <nav className="space-y-1.5">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm shadow-sidebar-accent/10'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('h-4 w-4 transition-colors', active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-primary')} />
                    {item.label}
                  </div>
                  {active && <ChevronRight className="h-4 w-4 opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full h-auto flex items-center justify-start gap-3 p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-xl transition-all">
                <Avatar className="h-9 w-9 border border-sidebar-border shadow-sm">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-sidebar-primary/10 text-sidebar-primary font-semibold">
                    {(user.full_name || user.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start truncate overflow-hidden">
                  <span className="truncate w-full font-medium text-sm leading-none">
                    {user.full_name || 'My Account'}
                  </span>
                  <span className="truncate w-full text-xs text-sidebar-foreground/60 mt-1 capitalize">
                    {role.replace('_', ' ')}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl border border-border/50 shadow-xl shadow-primary/5">
              <div className="p-2 mb-2">
                <p className="text-sm font-medium">{user.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="cursor-pointer rounded-lg mt-1"
              >
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                Theme: {theme === 'dark' ? 'Light' : 'Dark'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground rounded-lg">
                <form action={signOut} className="w-full">
                  <button type="submit" className="flex w-full items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-background h-screen overflow-hidden">
        {/* Mobile Header (if you add mobile nav later) */}
        <div className="h-16 border-b border-border/40 flex items-center px-6 md:hidden">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            HRMS
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="mx-auto max-w-6xl w-full fade-in zoom-in-95 duration-200">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
