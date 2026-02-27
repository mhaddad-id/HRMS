'use client';

import { useState } from 'react';
import { updateUserRole } from '@/app/actions/admin';
import type { User, UserRole } from '@/lib/database.types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UsersTableProps {
    users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
    const { toast } = useToast();
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

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
                toast({
                    title: 'Error',
                    description: res.error,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'User role updated successfully.',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'An unexpected error occurred.',
                variant: 'destructive',
            });
        } finally {
            setLoadingIds((prev) => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        }
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>First Name</TableHead>
                        <TableHead>Last Name</TableHead>
                        <TableHead>Supervisor</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        (() => {
                            const fallback = getFallbackNameParts(user);
                            const firstName = user.first_name ?? fallback.first;
                            const lastName = user.last_name ?? fallback.last;
                            return (
                        <TableRow key={user.id}>
                            <TableCell className="whitespace-nowrap">{firstName || '—'}</TableCell>
                            <TableCell className="whitespace-nowrap">{lastName || '—'}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.supervisor ?? '—'}</TableCell>
                            <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                            <TableCell>
                                <Select
                                    disabled={loadingIds.has(user.id)}
                                    value={user.role}
                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="hr_manager">HR Manager</SelectItem>
                                        <SelectItem value="employee">Employee</SelectItem>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                            );
                        })()
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
