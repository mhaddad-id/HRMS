import { z } from 'zod';

export const leaveSchema = z
  .object({
    leave_type: z.enum(['annual', 'sick', 'unpaid', 'other']),
    start_date: z.string().min(1),
    end_date: z.string().min(1),
    reason: z.string().optional(),
  })
  .refine((d) => new Date(d.end_date) >= new Date(d.start_date), {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

export type LeaveFormValues = z.infer<typeof leaveSchema>;
