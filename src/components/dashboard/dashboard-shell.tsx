'use client';

import { useState } from 'react';
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
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  hr_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user.role ?? 'employee';
  const filteredNav = navItems.filter((n) => !n.roles || n.roles.includes(role));
  const initials = (user.full_name || user.email).slice(0, 2).toUpperCase();
  const roleLabel = role.replace('_', ' ');
  const roleBadge = ROLE_COLORS[role] ?? ROLE_COLORS.employee;

  /* ── page title from pathname ─────────────────── */
  const currentPage =
    filteredNav.find(
      (n) => pathname === n.href || (n.href !== '/dashboard' && pathname.startsWith(n.href + '/'))
    )?.label ?? 'Dashboard';

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Mobile overlay ──────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────── */}
      <aside
        className={cn(
          'sidebar-transition fixed md:relative z-40 flex flex-col h-screen shrink-0',
          'border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
          /* desktop collapsed / expanded */
          sidebarOpen ? 'md:w-[260px]' : 'md:w-[68px]',
          /* mobile: slide-in drawer */
          'w-[260px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-sidebar-border shrink-0',
            sidebarOpen ? 'px-5 gap-3' : 'px-0 justify-center'
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
          >
            <div className="shrink-0 bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-xl flex items-center justify-center shadow-md shadow-sidebar-primary/30">
              <Users className="w-4 h-4" />
            </div>
            {sidebarOpen && (
              <span className="label-transition opacity-100">HRMS</span>
            )}
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar">
          {sidebarOpen && (
            <p className="mb-3 px-5 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-widest label-transition">
              Main Menu
            </p>
          )}
          <nav className={cn('space-y-1', sidebarOpen ? 'px-3' : 'px-2')}>
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    'group relative flex items-center rounded-xl transition-all duration-200',
                    sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center px-0 py-2.5',
                    active
                      ? 'bg-sidebar-primary/10 text-sidebar-primary font-semibold shadow-sm'
                      : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  {/* Active left-border indicator */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-sidebar-primary" />
                  )}

                  <Icon
                    className={cn(
                      'h-[18px] w-[18px] shrink-0 transition-colors',
                      active
                        ? 'text-sidebar-primary'
                        : 'text-sidebar-foreground/40 group-hover:text-sidebar-primary/70'
                    )}
                  />

                  {sidebarOpen && (
                    <span className="label-transition flex-1 text-sm opacity-100">
                      {item.label}
                    </span>
                  )}

                  {sidebarOpen && active && (
                    <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full h-auto rounded-xl hover:bg-sidebar-accent transition-all group',
                  sidebarOpen ? 'flex items-center gap-3 px-3 py-2.5 justify-start' : 'flex items-center justify-center p-2'
                )}
              >
                <Avatar className="h-8 w-8 shrink-0 border-2 border-sidebar-border shadow-sm group-hover:border-sidebar-primary/50 transition-colors">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-sidebar-primary/15 text-sidebar-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {sidebarOpen && (
                  <div className="label-transition flex flex-col items-start overflow-hidden opacity-100">
                    <span className="truncate w-full font-semibold text-sm leading-none">
                      {user.full_name || 'My Account'}
                    </span>
                    <span
                      className={cn(
                        'mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize',
                        roleBadge
                      )}
                    >
                      {roleLabel}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side={sidebarOpen ? 'top' : 'right'}
              className="w-60 p-2 rounded-xl border border-border/50 shadow-xl shadow-primary/5"
            >
              <div className="p-2 mb-2">
                <p className="text-sm font-semibold">{user.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className={cn('mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize', roleBadge)}>
                  {roleLabel}
                </span>
              </div>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="cursor-pointer rounded-lg mt-1"
              >
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                Theme: {theme === 'dark' ? 'Light' : 'Dark'}
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground rounded-lg"
              >
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

      {/* ── Main area ─────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-background h-screen overflow-hidden">

        {/* Top header */}
        <header className="h-16 shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-4 md:px-6 gap-4 sticky top-0 z-20">
          {/* Sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen((prev) => !prev);
              } else {
                setSidebarOpen((prev) => !prev);
              }
            }}
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </Button>

          {/* Page title */}
          <div className="flex-1">
            <h1 className="text-base font-semibold text-foreground leading-none">{currentPage}</h1>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Bell */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
              asChild
            >
              <Link href="/dashboard/notifications" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Link>
            </Button>

            {/* Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl p-0">
                  <Avatar className="h-8 w-8 border-2 border-border hover:border-primary/50 transition-colors">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border border-border/50 shadow-xl">
                <div className="p-2 mb-1">
                  <p className="text-sm font-semibold">{user.full_name || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="cursor-pointer rounded-lg"
                >
                  {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  Toggle theme
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground rounded-lg"
                >
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
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
          <div className="mx-auto max-w-screen-2xl w-full fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
