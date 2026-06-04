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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<string | null>(null);

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
    // Optimistic update for instant feedback
    setAccessList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
    try {
      await updateOfficeAccess(id, { [field]: value });
      toast({
        title: 'Success',
        description: 'Permission updated',
      });
      // Removed loadData() to avoid long wait times
    } catch (error) {
      // Revert optimistic update on error
      setAccessList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: !value } : a))
      );
      toast({
        title: 'Error',
        description: 'Failed to update permission',
        variant: 'destructive',
      });
    }
  }

  function handleRemoveClick(id: string) {
    setUserToRemove(id);
    setConfirmOpen(true);
  }

  async function handleRemove() {
    if (!userToRemove) return;
    try {
      await removeUserFromOffice(userToRemove);
      toast({
        title: 'Success',
        description: 'User removed from office',
      });
      setUserToRemove(null);
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
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <Shield className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
              <Shield className="h-8 w-8" /> Security & Access
            </DialogTitle>
          </DialogHeader>
          <p className="text-blue-100/80 text-sm mt-2 font-medium">Manage individual staff permissions for <span className="text-white font-bold">{office.name}</span>.</p>
          <div className="absolute right-8 top-8 opacity-20">
            <Shield className="h-16 w-16" />
          </div>
        </div>

        <div className="p-8 space-y-8 bg-background">
          {/* Add User Section */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl bg-muted/30 border border-border/50 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <UserPlus className="h-12 w-12" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Assign New Member</p>
              <p className="text-xs text-muted-foreground font-medium italic">Grant access to this specific office location.</p>
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="h-12 rounded-xl bg-background border-border/50 shadow-xs focus:ring-emerald-500">
                    <SelectValue placeholder="Search colleagues to assign..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-2xl border-none p-1">
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id} className="rounded-lg py-2">
                        <span className="flex flex-col items-start gap-0.5">
                          <span>{user.full_name || user.email}</span>
                          {user.role && (
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              {user.role.replace('_', ' ')}
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                    {availableUsers.length === 0 && (
                      <p className="p-4 text-xs text-muted-foreground text-center font-medium italic italic">No more users available to assign</p>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAddUser}
                disabled={!selectedUserId || addingUser}
                className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                {addingUser ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
                Assign Access
              </Button>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Authorized Staff Members</p>
            </div>
            <div className="rounded-2xl border border-border/50 overflow-hidden shadow-sm bg-background">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 pl-6">Full Name / Profile</TableHead>
                    <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4">Office Admin</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground py-4 pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessList.map((access) => (
                    <TableRow key={access.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors group">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[11px] font-black shadow-inner ring-2 ring-white transition-transform group-hover:scale-110">
                            {access.users?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <p className="font-bold text-sm leading-tight text-foreground group-hover:text-emerald-600 transition-colors">{access.users?.full_name || 'Unnamed Staff'}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{access.users?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Switch
                          checked={access.is_admin}
                          onCheckedChange={(val: boolean) => togglePermission(access.id, 'is_admin', val)}
                          className="data-[state=checked]:bg-emerald-600 border-none shadow-xs"
                        />
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-destructive rounded-xl transition-all shadow-none mt-0.5"
                          onClick={() => handleRemoveClick(access.id)}
                        >
                          <Trash2 className="w-4 h-4 ml-0.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {accessList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-16 text-muted-foreground bg-muted/10">
                        <div className="flex flex-col items-center gap-3">
                          <Shield className="h-10 w-10 opacity-10 animate-pulse" />
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground/70">No direct permissions assigned</p>
                            <p className="text-[11px] max-w-xs mx-auto mt-1 leading-relaxed px-6">System Administrators and HR Managers maintain global access to all locations naturally.</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChangeAction={setConfirmOpen}
        onConfirmAction={handleRemove}
        title="Remove Staff Access"
        description="Are you sure you want to remove this staff member's access to this office? This action cannot be undone."
        confirmLabel="Remove Access"
        variant="destructive"
      />
    </Dialog>

  );
}
