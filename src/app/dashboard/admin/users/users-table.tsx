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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Building2, Search, User as UserIcon } from 'lucide-react';

type UserWithEmployee = User & {
    employee?: {
        id: string;
        first_name: string;
        last_name: string;
        profile_photo_url?: string | null;
        employee_code: string | null;
        position: string | null;
        office: string | null;
        supervisor_record?: { id: string; first_name: string; last_name: string; profile_photo_url?: string | null } | null;
    } | null;
};

interface UsersTableProps {
    users: UserWithEmployee[];
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    hr_manager: 'HR Manager',
    employee: 'Employee',
};

const ROLE_BADGE_VARIANTS: Record<string, string> = {
    admin: 'bg-red-600/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200/50',
    hr_manager: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200/50',
    employee: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50',
};

function UserAvatar({ name, email, avatar_url }: { name?: string | null; email: string; avatar_url?: string | null }) {
    const displayName = name || email;
    const initials = displayName.slice(0, 2).toUpperCase();
    const colors = [
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
        'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
        'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400',
    ];
    const colorIdx = displayName.charCodeAt(0) % colors.length;
    return (
        <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={avatar_url ?? undefined} className="object-cover" />
            <AvatarFallback className={`text-xs font-bold ${colors[colorIdx]}`}>
                {initials}
            </AvatarFallback>
        </Avatar>
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
        const empCode = (user.employee?.employee_code || '').toLowerCase();
        const empPosition = (user.employee?.position || '').toLowerCase();

        return fullName.includes(query) ||
            email.includes(query) ||
            empCode.includes(query) ||
            empPosition.includes(query);
    });


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
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            {['Code', 'User', 'Position', 'Supervisor', 'Office', 'Role'].map((col) => (
                                <TableHead
                                    key={col}
                                    className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                                >
                                    {col}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => {
                            const emp = user.employee;
                            const supervisorName = emp?.supervisor_record
                                ? `${emp.supervisor_record.first_name} ${emp.supervisor_record.last_name}`
                                : null;

                            return (
                                <TableRow key={user.id} className="last:border-0">
                                    {/* Code */}
                                    <TableCell className="px-4 py-3">
                                        <span className="text-sm font-medium">{emp?.employee_code || '—'}</span>
                                    </TableCell>

                                    {/* User (avatar + email) */}
                                    <TableCell className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <UserAvatar
                                                name={user.full_name}
                                                email={user.email}
                                                avatar_url={user.avatar_url || emp?.profile_photo_url}
                                            />
                                            <div>
                                                <p className="font-medium text-sm leading-tight">{user.full_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground leading-tight truncate max-w-[180px]">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Position */}
                                    <TableCell className="px-4 py-3">
                                        <span className="text-sm font-medium">{emp?.position ?? <span className="text-muted-foreground text-xs">—</span>}</span>
                                    </TableCell>

                                    {/* Supervisor */}
                                    <TableCell className="px-4 py-3">
                                        {supervisorName ? (
                                            <div className="flex items-center gap-2">
                                                <UserAvatar
                                                    name={supervisorName}
                                                    email=""
                                                    avatar_url={emp?.supervisor_record?.profile_photo_url}
                                                />
                                                <span className="text-sm">{supervisorName}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    {/* Office */}
                                    <TableCell className="px-4 py-3">
                                        {emp?.office ? (
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                {emp.office}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                    </TableCell>
                                    {/* Role */}
                                    <TableCell className="px-4 py-3">
                                        <Select
                                            disabled={loadingIds.has(user.id)}
                                            value={user.role}
                                            onValueChange={(val) => handleRoleChange(user.id, val)}
                                        >
                                            <SelectTrigger className="h-8 w-[140px] text-xs shadow-none border-border bg-transparent">
                                                <SelectValue>
                                                    <Badge className={`text-[10px] uppercase font-bold px-2 py-0 border ${ROLE_BADGE_VARIANTS[user.role] ?? ROLE_BADGE_VARIANTS.employee}`}>
                                                        {ROLE_LABELS[user.role] ?? user.role}
                                                    </Badge>
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="admin" className="rounded-lg text-xs">Admin</SelectItem>
                                                <SelectItem value="hr_manager" className="rounded-lg text-xs">HR Manager</SelectItem>
                                                <SelectItem value="employee" className="rounded-lg text-xs">Employee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
