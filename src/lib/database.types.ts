export type UserRole = 'admin' | 'hr_manager' | 'employee';
export type EmployeeStatus = 'active' | 'inactive';
export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  supervisor: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string | null;
  department_id: string | null;
  employee_code: string;
  pay_no: string | null;
  first_name: string;
  last_name: string;
  identity_no: string | null;
  email: string;
  phone: string | null;
  father_name: string | null;
  mother_name: string | null;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact: string | null;
  position: string;
  salary: number;
  employment_date: string;
  ending_date: string | null;
  supervisor: string | null;
  office: string | null;
  annual_score: number | null;
  sick_score: number | null;
  competence_score: number | null;
  status: EmployeeStatus;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Leave {
  id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee | null;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  work_date: string;
  clock_in: string | null;
  clock_out: string | null;
  regular_hours: number;
  overtime_hours: number;
  late_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee | null;
}

export interface Payroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  overtime_pay: number;
  deductions: number;
  worked_days: number | null;
  leave_without_pay: number | null;
  currency: string | null;
  net_salary: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee | null;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  reviewer_id: string | null;
  review_period_start: string;
  review_period_end: string;
  score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: Employee | null;
}

export interface Meeting {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  read_at: string | null;
  link: string | null;
  created_at: string;
}
