'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

interface LeaveRequestParams {
  employeeId: string;
  leaveType: 'annual' | 'sick' | 'unpaid' | 'other';
  startDate: string;
  endDate: string;
  reason?: string;
}

export async function submitLeaveRequest({
  employeeId,
  leaveType,
  startDate,
  endDate,
  reason,
}: LeaveRequestParams) {
  const admin = createAdminClient();

  // 1. Insert Leave Request
  const { data: newLeave, error: leaveError } = await admin
    .from('leaves')
    .insert({
      employee_id: employeeId,
      leave_type: leaveType,
      start_date: startDate,
      end_date: endDate,
      reason: reason || null,
      status: 'pending',
    })
    .select('id, employee_id')
    .single();

  if (leaveError) {
    console.error('Error submitting leave request:', leaveError);
    return { success: false, error: leaveError };
  }

  // 2. Fetch requester name
  const { data: requester } = await admin
    .from('employees')
    .select('first_name, last_name, supervisor_id')
    .eq('id', employeeId)
    .single();

  const requesterName = requester ? `${requester.first_name} ${requester.last_name}` : 'An employee';

  // 3. Find Supervisor's user_id
  if (requester?.supervisor_id) {
    const { data: supervisor } = await admin
      .from('employees')
      .select('user_id')
      .eq('id', requester.supervisor_id)
      .single();

    if (supervisor?.user_id) {
      await createNotification({
        userId: supervisor.user_id,
        title: 'New Leave Request (Manager Review Required)',
        message: `${requesterName} has requested ${leaveType} leave starting on ${startDate}.`,
        type: 'info',
        link: `/dashboard/leave/review/${newLeave.id}`, // Example link
      });
    }
  }

  // 4. Find all HR Managers and Admins
  const { data: hrStaff } = await admin
    .from('users')
    .select('id')
    .in('role', ['hr_manager', 'admin']);

  if (hrStaff && hrStaff.length > 0) {
    await Promise.all(
      hrStaff.map((hr) =>
        createNotification({
          userId: hr.id,
          title: 'New Leave Request (HR Copy)',
          message: `${requesterName} submitted a ${leaveType} leave request from ${startDate} to ${endDate}.`,
          type: 'info',
          link: `/dashboard/leave/admin`, // Example link
        })
      )
    );
  }

  revalidatePath('/dashboard/leave');
  return { success: true };
}

export async function updateLeaveStatus(
  leaveId: string,
  status: 'approved' | 'rejected',
  level: 'manager' | 'hr',
  reviewerId: string,
  notes?: string
) {
  const admin = createAdminClient();

  // 1. Fetch current leave state
  const { data: leave } = await admin
    .from('leaves')
    .select('*')
    .eq('id', leaveId)
    .single();

  if (!leave) return { success: false, error: 'Leave not found' };

  const updateData: any = {
    review_notes: notes || null,
    updated_at: new Date().toISOString(),
  };

  if (level === 'manager') {
    updateData.manager_status = status;
    updateData.manager_id = reviewerId;
    updateData.manager_at = new Date().toISOString();
    if (status === 'rejected') updateData.status = 'rejected';
  } else {
    updateData.hr_status = status;
    updateData.hr_id = reviewerId;
    updateData.hr_at = new Date().toISOString();
    updateData.status = status;
  }

  // 2. Perform Update
  const { error: updateError } = await admin
    .from('leaves')
    .update(updateData)
    .eq('id', leaveId);

  if (updateError) return { success: false, error: updateError };

  // 3. Handle Score Subtraction and Secondary Notifications
  if (level === 'manager' && status === 'approved') {
    // Notify HR that a request is ready for final approval
    const { data: hrStaff } = await admin
      .from('users')
      .select('id')
      .in('role', ['hr_manager', 'admin']);

    if (hrStaff && hrStaff.length > 0) {
      const { data: emp } = await admin
        .from('employees')
        .select('first_name, last_name')
        .eq('id', leave.employee_id)
        .single();
      const requesterName = emp ? `${emp.first_name} ${emp.last_name}` : 'An employee';

      await Promise.all(
        hrStaff.map((hr) =>
          createNotification({
            userId: hr.id,
            title: 'Manager Approved: Action Required',
            message: `${requesterName}'s leave request was approved by their manager and is now ready for your final review.`,
            type: 'warning',
            link: `/dashboard/leave`,
          })
        )
      );
    }
  } else if (level === 'hr' && status === 'approved') {
    if (leave.leave_type === 'annual' || leave.leave_type === 'sick') {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const { data: employee } = await admin
        .from('employees')
        .select('annual_score, sick_score')
        .eq('id', leave.employee_id)
        .single();

      if (employee) {
        const empUpdate: any = {};
        if (leave.leave_type === 'annual') empUpdate.annual_score = (employee.annual_score || 0) - duration;
        if (leave.leave_type === 'sick') empUpdate.sick_score = (employee.sick_score || 0) - duration;

        await admin.from('employees').update(empUpdate).eq('id', leave.employee_id);
      }
    }
  }

  // 4. Notify Employee
  const { data: empRecord } = await admin
    .from('employees')
    .select('user_id')
    .eq('id', leave.employee_id)
    .single();

  if (empRecord?.user_id) {
    const levelLabel = level === 'manager' ? 'Direct Manager' : 'HR Department';
    await createNotification({
      userId: empRecord.user_id,
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leave.leave_type} leave request (${leave.start_date}) has been ${status} by the ${levelLabel}.`,
      type: status === 'approved' ? 'success' : 'danger',
      link: `/dashboard/leave`,
    });
  }

  revalidatePath('/dashboard/leave');
  return { success: true };
}
