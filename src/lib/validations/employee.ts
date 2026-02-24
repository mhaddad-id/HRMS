import { z } from 'zod';

export const employeeSchema = z.object({
  employee_code: z.string().min(1, 'Employee code is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  department_id: z.string().uuid().optional().nullable(),
  position: z.string().min(1, 'Position is required'),
  salary: z.number().min(0, 'Salary must be non-negative'),
  employment_date: z.string().min(1, 'Employment date is required'),
  status: z.enum(['active', 'inactive']),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
