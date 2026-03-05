import { createClient } from '@/lib/supabase/server';
import { UsersTable } from './users-table';

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Fetch users with their linked employee record (for name, office, supervisor)
    const { data: users, error } = await supabase
        .from('users')
        .select('*, employee:employees!user_id(id, first_name, last_name, office, supervisor:employees!supervisor_id(id, first_name, last_name))')
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
            <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage organization users and roles</p>
            </div>
            <UsersTable users={users || []} />
        </div>
    );
}
