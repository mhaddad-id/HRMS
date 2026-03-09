'use client';

import { useState, useEffect } from 'react';
import {
  getOfficeAccess,
  updateOfficeAccess,
  addUserToOffice,
  removeUserFromOffice,
  getUsers
} from '@/app/actions/offices';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { Shield, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OfficePermissionsProps {
  office: {
    id: string;
    name: string;
  };
}

export function OfficePermissions({ office }: OfficePermissionsProps) {
  const [accessList, setAccessList] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [office.id]);

  async function loadData() {
    setLoading(true);
    try {
      const [accessData, usersData] = await Promise.all([
        getOfficeAccess(office.id),
        getUsers()
      ]);
      setAccessList(accessData);
      setAllUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load permissions data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    if (!selectedUserId) return;
    setAddingUser(true);
    try {
      await addUserToOffice(office.id, selectedUserId, {
        is_admin: false
      });
      toast({
        title: 'Success',
        description: 'User added to office successfully',
      });
      setSelectedUserId('');
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'User might already have access to this office',
        variant: 'destructive',
      });
    } finally {
      setAddingUser(false);
    }
  }

  async function togglePermission(id: string, field: string, value: boolean) {
    try {
      await updateOfficeAccess(id, { [field]: value });
      toast({
        title: 'Success',
        description: 'Permission updated',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await removeUserFromOffice(id);
      toast({
        title: 'Success',
        description: 'User removed from office',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove user',
        variant: 'destructive',
      });
    }
  }

  // Filter out users who already have access
  const availableUsers = allUsers.filter(
    u => !accessList.some(a => a.user_id === u.id)
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary hover:bg-primary/5">
          <Shield className="w-4 h-4" />
          Permissions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Manage Permissions - {office.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Add User Section */}
          <div className="flex items-end gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-semibold">Assign User to Office</p>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select a user to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                  {availableUsers.length === 0 && (
                    <p className="p-2 text-xs text-muted-foreground text-center">No more users available</p>
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddUser}
              disabled={!selectedUserId || addingUser}
              className="h-9 gap-2"
            >
              {addingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Assign
            </Button>
          </div>

          {/* Permissions Table */}
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider">User</TableHead>
                  <TableHead className="text-center text-[11px] font-bold uppercase tracking-wider">Office Admin</TableHead>
                  <TableHead className="text-right text-[11px] font-bold uppercase tracking-wider pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accessList.map((access) => (
                  <TableRow key={access.id} className="hover:bg-muted/10 transition-colors">
                    <TableCell className="py-3">
                      <div>
                        <p className="font-medium text-sm">{access.users?.full_name || 'Unnamed User'}</p>
                        <p className="text-xs text-muted-foreground">{access.users?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center py-3">
                      <Switch
                        checked={access.is_admin}
                        onCheckedChange={(val: boolean) => togglePermission(access.id, 'is_admin', val)}
                      />
                    </TableCell>
                    <TableCell className="text-right py-3 pr-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(access.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {accessList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      <p className="text-sm">No individual permissions assigned.</p>
                      <p className="text-xs">System Admins and HR Managers have full access by default.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
