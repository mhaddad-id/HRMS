import type { UserRole } from '@/lib/database.types';

export const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  hr_manager: '/dashboard/hr',
  employee: '/dashboard/employee',
};

export function roleHome(role: UserRole | null | undefined): string {
  return ROLE_HOME[role ?? 'employee'];
}

const ADMIN_ONLY_PREFIXES = ['/dashboard/admin'];
const HR_ONLY_PREFIXES = ['/dashboard/hr'];
const EMPLOYEE_ONLY_PREFIXES = ['/dashboard/employee'];

const ADMIN_OR_HR_PREFIXES = ['/dashboard/employees', '/dashboard/performance'];

export function isDashboardPathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (!pathname.startsWith('/dashboard')) return true;

  if (role === 'admin') return true;

  if (ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;

  if (role === 'hr_manager') {
    if (EMPLOYEE_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
    return true;
  }

  // employee
  if (HR_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
  if (ADMIN_OR_HR_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return false;
  return true;
}

