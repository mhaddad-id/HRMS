import { z } from 'zod';

export const employeeSchema = z.object({
  employee_code: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  identity_no: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  office: z.string().optional().nullable(),
  office_id: z.string().uuid().optional().nullable(),
  supervisor_id: z.string().uuid().optional().nullable(),
  salary: z.number().min(0, 'Salary must be non-negative'),
  employment_date: z.string().min(1, 'Employment date is required'),
  ending_date: z.string().optional(),
  supervisor: z.string().optional(),
  annual_score: z.number().int().min(0).optional(),
  sick_score: z.number().int().min(0).optional(),
  competence_score: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive']),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
