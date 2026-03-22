'use client';

import { useState, useEffect } from 'react';
import { Search, Printer, Trash2, Calendar, User, Briefcase, FileText, CheckCircle2, Clock, XCircle, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { updateLeaveStatus } from '@/app/actions/leaves';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';



interface LeaveRow {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  manager_status: string;
  hr_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_code: string;
    position: string;
    office: { id: string; name: string } | null;
    supervisor_id: string | null;
    supervisor_record?: { id: string; first_name: string; last_name: string } | null;
  } | null;
}

export function LeaveList({
  leaves,
  isHR,
  canApprove,
  userRole,
  currentEmployeeId,
  requiresOfficeSelection,
}: {
  leaves: LeaveRow[];
  isHR: boolean;
  canApprove: boolean;
  userRole?: string;
  currentEmployeeId?: string;
  requiresOfficeSelection?: boolean;
}) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionLevel, setRejectionLevel] = useState<'manager' | 'hr'>('manager');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Set initial selection
  useEffect(() => {
    if (leaves.length > 0 && !selectedId) {
      setSelectedId(leaves[0].id);
    }
  }, [leaves, selectedId]);

  const filteredLeaves = leaves.filter(leave => {
    const searchStr = `${leave.employee?.first_name} ${leave.employee?.last_name} ${leave.employee?.employee_code} ${leave.leave_type}`.toLowerCase();
    const matchesSearch = searchStr.includes(globalFilter.toLowerCase());

    return matchesSearch;
  });

  const selectedLeave = leaves.find(l => l.id === selectedId) || null;

  function calculateDays(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    const diffTime = e.getTime() - s.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  const isAdminOrHR = userRole === 'admin' || userRole === 'hr_manager';

  async function updateStatus(leaveId: string, status: 'approved' | 'rejected', level: 'manager' | 'hr', notes?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const result = await updateLeaveStatus(leaveId, status, level, user.id, notes);
      if (result.success) {
        router.refresh();
      } else {
        console.error('Failed to update leave status:', result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteLeave(leaveId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('leaves').delete().eq('id', leaveId);
    if (!error) {
      if (selectedId === leaveId) setSelectedId(null);
      setDeleteId(null);
      router.refresh();
    }
  }

  const handleReject = async () => {
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      await updateStatus(rejectingId, 'rejected', rejectionLevel, rejectionReason);
      setRejectingId(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (requiresOfficeSelection) {
    return (
      <div className="p-8 text-center text-muted-foreground bg-card border rounded-xl shadow-sm">
        Please select an office to view leave records.
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      {/* Master List (Right Side on large screens, usually list) */}
      <div className="w-full lg:w-[320px] order-2 lg:order-2 flex flex-col gap-4 print:hidden">
        <div className="flex flex-col gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 bg-card border-none shadow-sm focus-visible:ring-emerald-500"
            />
          </div>
        </div>


        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {filteredLeaves.map((leave) => (
            <div
              key={leave.id}
              onClick={() => setSelectedId(leave.id)}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer group hover:shadow-md",
                selectedId === leave.id
                  ? "bg-emerald-50 border-emerald-200 shadow-sm dark:bg-emerald-900/30 dark:border-emerald-700"
                  : "bg-card border-transparent hover:border-emerald-100 dark:bg-gray dark:hover:border-emerald-800"
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold uppercase">
                    {leave.employee?.first_name[0]}{leave.employee?.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">
                      {leave.employee?.first_name} {leave.employee?.last_name}
                    </p>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-medium capitalize",
                      leave.status === 'approved' ? "bg-green-100 text-green-700" :
                        leave.status === 'rejected' ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-700"
                    )}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate capitalize">
                    {leave.leave_type} Leave • {formatDate(leave.start_date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredLeaves.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No requests found
            </div>
          )}
        </div>
      </div>

      {/* Detail View (Left/Main Side) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card/50 rounded-2xl border p-6 order-1 lg:order-1 relative shadow-sm print:shadow-none print:border-none print:p-0 print:bg-white">
        {selectedLeave ? (
          <div className="space-y-8 print:block">
            {/* Header Actions */}
            <div className="flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Leave Details</h2>
              </div>
              <div className="flex items-center gap-2">
                {isAdminOrHR && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                      <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(selectedLeave.id)} className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/5">
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-8">
              {/* Stepper / Timeline */}
              <div className="flex flex-col gap-0 md:border-r pr-4 relative">
                <div className="absolute top-8 bottom-8 left-[19px] w-0.5 bg-muted hidden md:block" />

                {/* Step 1: Request */}
                <div className="relative flex items-start gap-4 pb-8">
                  <div className="z-10 bg-emerald-500 text-white rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-bold">Leave Request</p>
                    <p className="text-[11px] text-muted-foreground">{formatDate(selectedLeave.created_at)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">RQ</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-medium opacity-70">Initiated</span>
                    </div>
                  </div>
                </div>

                {/* Step 2: Manager Approval */}
                <div className="relative flex items-start gap-4 pb-8">
                  <div className={cn(
                    "z-10 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-md",
                    selectedLeave.status !== 'pending' ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-bold">Manager Approval</p>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedLeave.employee?.supervisor_record
                        ? `${selectedLeave.employee.supervisor_record.first_name} ${selectedLeave.employee.supervisor_record.last_name}`
                        : "Direct Supervisor"}
                    </p>
                    <div className="mt-1">
                      {selectedLeave.manager_status === 'approved' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> Approved
                        </div>
                      ) : selectedLeave.manager_status === 'rejected' ? (
                        <div className="flex items-center gap-1.5 text-destructive font-medium text-[10px]">
                          <XCircle className="h-3 w-3" /> Rejected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 font-medium text-[10px]">
                          <Clock className="h-3 w-3" /> In Progress
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 3: HR Approval */}
                <div className="relative flex items-start gap-4 pb-8">
                  <div className={cn(
                    "z-10 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-md",
                    selectedLeave.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  )}>
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-bold">HR Approval</p>
                    <p className="text-[11px] text-muted-foreground">Admin/HR Review</p>
                    <div className="mt-1">
                      {selectedLeave.hr_status === 'approved' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[10px]">
                          <CheckCircle2 className="h-3 w-3" /> Approved
                        </div>
                      ) : selectedLeave.hr_status === 'rejected' ? (
                        <div className="flex items-center gap-1.5 text-destructive font-medium text-[10px]">
                          <XCircle className="h-3 w-3" /> Rejected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium text-[10px]">
                          <Clock className="h-3 w-3" /> Pending
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 4: Finished */}
                <div className="relative flex items-start gap-4">
                  <div className={cn(
                    "z-10 rounded-full p-2 h-10 w-10 flex items-center justify-center shrink-0 shadow-md transition-colors",
                    selectedLeave.status !== 'pending' ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-bold">Process State</p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      selectedLeave.status === 'approved' ? "text-emerald-500" :
                        selectedLeave.status === 'rejected' ? "text-destructive" :
                          "text-muted-foreground"
                    )}>
                      {selectedLeave.status === 'pending' ? 'Ongoing' : 'Completed'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center Content Boxes */}
              <div className="space-y-6">
                {/* Employee Details Box */}
                <div className="p-6 rounded-2xl bg-card border border-muted shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Employee Details</h3>
                  <div className="flex items-center gap-5">
                    <Avatar className="h-16 w-16 border-2 border-emerald-100 shadow-sm">
                      <AvatarFallback className="bg-emerald-500 text-white text-xl font-bold">
                        {selectedLeave.employee?.first_name[0]}{selectedLeave.employee?.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 flex-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">Full Name</p>
                        <p className="text-sm font-bold">{selectedLeave.employee?.first_name} {selectedLeave.employee?.last_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">Employee ID</p>
                        <p className="text-sm font-bold">{selectedLeave.employee?.employee_code}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">Position</p>
                        <p className="text-sm font-bold">{selectedLeave.employee?.position || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-medium">Office</p>
                        <p className="text-sm font-bold">{selectedLeave.employee?.office?.name || '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Details Box */}
                <div className="p-6 rounded-2xl bg-card border border-muted shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Request Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-1">
                        <p className="text-[10px] text-muted-foreground font-medium">Type</p>
                        <p className="text-sm font-bold capitalize">{selectedLeave.leave_type}</p>
                      </div>
                      <div className="col-span-1 text-right md:text-left">
                        <p className="text-[10px] text-muted-foreground font-medium">Duration</p>
                        <p className="text-sm font-bold">{calculateDays(selectedLeave.start_date, selectedLeave.end_date)} Days</p>
                      </div>
                      <div className="col-span-1">
                        <p className="text-[10px] text-muted-foreground font-medium">Start Date</p>
                        <p className="text-sm font-bold">{formatDate(selectedLeave.start_date)}</p>
                      </div>
                      <div className="col-span-1 text-right">
                        <p className="text-[10px] text-muted-foreground font-medium">End Date</p>
                        <p className="text-sm font-bold">{formatDate(selectedLeave.end_date)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-muted-foreground font-medium">Reason / Notes</p>
                      <p className="text-sm p-4 bg-muted/40 rounded-xl rounded-tl-none mt-1 border border-muted/50 leading-relaxed italic">
                        {selectedLeave.reason || 'No reason provided.'}
                      </p>
                    </div>

                    {selectedLeave.review_notes && (
                      <div className="pt-2 border-t border-dashed">
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Reviewer Feedback</p>
                        <p className="text-xs font-medium mt-1 text-muted-foreground">{selectedLeave.review_notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons (Approve/Reject) */}
                {selectedLeave.status === 'pending' && (
                  <div className="flex flex-col gap-3 pt-4 print:hidden">
                    {/* Manager Approval Button */}
                    {currentEmployeeId && selectedLeave.employee?.supervisor_id === currentEmployeeId && selectedLeave.manager_status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200 transition-all dark:shadow-none"
                          onClick={() => updateStatus(selectedLeave.id, 'approved', 'manager')}
                        >
                          Approve (As Manager)
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-2 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          onClick={() => {
                            setRejectionLevel('manager');
                            setRejectingId(selectedLeave.id);
                          }}
                        >
                          Reject (As Manager)
                        </Button>
                      </div>
                    )}

                    {/* HR Approval Button */}
                    {isAdminOrHR && selectedLeave.hr_status === 'pending' && (selectedLeave.manager_status === 'approved' || (currentEmployeeId && selectedLeave.employee?.supervisor_id === currentEmployeeId)) && (
                      <div className="flex gap-3">
                        <Button
                          className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all dark:shadow-none"
                          onClick={() => updateStatus(selectedLeave.id, 'approved', 'hr')}
                        >
                          {selectedLeave.manager_status === 'pending' ? 'Direct Approval (HR)' : 'Approve (As HR)'}
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-12 rounded-xl border-2 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                          onClick={() => {
                            setRejectionLevel('hr');
                            setRejectingId(selectedLeave.id);
                          }}
                        >
                          Reject (As HR)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
            </div>
            <div>
              <h3 className="text-lg font-bold">No Leave Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Select a request from the list to view its progression and details.</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection</Label>
              <Textarea
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="rounded-xl border-muted min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectingId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isSubmitting}
              className="rounded-xl font-bold bg-destructive"
            >
              {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this leave request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteLeave(deleteId)}
              className="rounded-xl font-bold bg-destructive"
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
