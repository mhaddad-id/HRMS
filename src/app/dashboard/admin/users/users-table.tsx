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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                                No users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
