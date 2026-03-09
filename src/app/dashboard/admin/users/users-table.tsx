'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/admin';
import type { User, UserRole } from '@/lib/database.types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Building2, Search, User as UserIcon } from 'lucide-react';

type UserWithEmployee = User & {
    employee?: {
        id: string;
        first_name: string;
        last_name: string;
        office: string | null;
        supervisor?: { id: string; first_name: string; last_name: string } | null;
    } | null;
};

interface UsersTableProps {
    users: UserWithEmployee[];
}

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    hr_manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    hr_manager: 'HR Manager',
    employee: 'Employee',
};

function UserAvatar({ name, email }: { name?: string | null; email: string }) {
    const displayName = name || email;
    const initials = displayName.slice(0, 2).toUpperCase();
    const colors = [
        'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
        'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    ];
    const colorIdx = displayName.charCodeAt(0) % colors.length;
    return (
        <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${colors[colorIdx]}`}>
            {initials}
        </div>
    );
}

export function UsersTable({ users }: UsersTableProps) {
    const { toast } = useToast();
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();
        const fullName = (user.full_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const empFirstName = (user.employee?.first_name || '').toLowerCase();
        const empLastName = (user.employee?.last_name || '').toLowerCase();

        return fullName.includes(query) ||
            email.includes(query) ||
            empFirstName.includes(query) ||
            empLastName.includes(query);
    });

    const getFallbackNameParts = (user: User) => {
        const directFirst = user.first_name ?? '';
        const directLast = user.last_name ?? '';
        if (directFirst || directLast) return { first: directFirst, last: directLast };
        const full = (user.full_name ?? '').trim();
        if (!full) return { first: '', last: '' };
        const parts = full.split(/\s+/);
        return {
            first: parts[0] ?? '',
            last: parts.slice(1).join(' '),
        };
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoadingIds((prev) => new Set(prev).add(userId));
        try {
            const res = await updateUserRole(userId, newRole as UserRole);
            if (res?.error) {
                toast({ title: 'Error', description: res.error, variant: 'destructive' });
            } else {
                toast({ title: 'Success', description: 'User role updated successfully.' });
            }
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    if (users.length === 0) {
        return (
            <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-1">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-foreground">No users found</p>
                    <p className="text-sm text-muted-foreground">Users registered in the system will appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">All Users</h2>
                    <p className="text-sm text-muted-foreground">
                        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                    </p>
                </div>
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 max-w-sm w-full sm:w-[240px]"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="relative w-full overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                {['ID', 'User', 'Name', 'Surname', 'Office', 'Supervisor', 'Role'].map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const emp = user.employee;
                                const supervisorName = emp?.supervisor
                                    ? `${emp.supervisor.first_name} ${emp.supervisor.last_name}`
                                    : null;
                                const shortId = user.id.slice(0, 8);

                                return (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                        {/* ID */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                {shortId}…
                                            </span>
                                        </td>

                                        {/* User (avatar + email) */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <UserAvatar name={user.full_name} email={user.email} />
                                                <div>
                                                    <p className="font-medium text-sm leading-tight">{user.full_name || '—'}</p>
                                                    <p className="text-xs text-muted-foreground leading-tight truncate max-w-[180px]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* First Name */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="text-sm">{emp?.first_name ?? <span className="text-muted-foreground text-xs">—</span>}</span>
                                        </td>

                                        {/* Last Name */}
                                        <td className="px-4 py-3 align-middle">
                                            <span className="text-sm">{emp?.last_name ?? <span className="text-muted-foreground text-xs">—</span>}</span>
                                        </td>

                                        {/* Office */}
                                        <td className="px-4 py-3 align-middle">
                                            {emp?.office ? (
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                    {emp.office}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Supervisor */}
                                        <td className="px-4 py-3 align-middle">
                                            {supervisorName ? (
                                                <span className="text-sm">{supervisorName}</span>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">—</span>
                                            )}
                                        </td>

                                        {/* Role */}
                                        <td className="px-4 py-3 align-middle">
                                            <Select
                                                disabled={loadingIds.has(user.id)}
                                                value={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                            >
                                                <SelectTrigger className="h-8 w-[140px] text-xs">
                                                    <SelectValue>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[user.role] ?? ROLE_COLORS.employee}`}>
                                                            {ROLE_LABELS[user.role] ?? user.role}
                                                        </span>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                                                    <SelectItem value="employee">Employee</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
