import { createClient } from '@/lib/supabase/server';
import { Users as UsersIcon } from 'lucide-react';
import { UsersTable } from './users-table';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Fetch users with their linked employee record (for name, office, supervisor)
    const { data: users, error } = await supabase
        .from('users')
        .select('*, employee:employees!user_id(id, first_name, last_name, profile_photo_url, employee_code, position, office, supervisor_record:supervisor_id(id, first_name, last_name, profile_photo_url))')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">Manage organization users and roles</p>
                </div>
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">
                    {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-200/50 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">User Management</h1>
                    <p className="text-muted-foreground">Manage organization users and roles</p>
                </div>
            </div>
            <UsersTable users={users || []} />
        </div>
    );
}
