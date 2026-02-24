# Database Schema (PostgreSQL / Supabase)

## Entity Relationship Overview

- **users** – extends Supabase auth (profile: role, full_name, avatar_url)
- **departments** – department master data
- **employees** – employee records; optional link to `users`, belongs to **departments**
- **leaves** – leave requests; belong to **employees**, reviewed by **users**
- **timesheets** – daily attendance; belong to **employees**
- **payroll** – payroll records; belong to **employees**
- **performance_reviews** – reviews; belong to **employees**, optional reviewer **users**
- **meetings** – meetings; created_by **users**
- **meeting_participants** – many-to-many **meetings** ↔ **users**
- **notifications** – in-app notifications; belong to **users**

## Tables (from migrations)

See `supabase/migrations/001_initial_schema.sql` for full DDL. Summary:

| Table                | Key columns                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| departments          | id, name, code, description                                                 |
| users                | id (FK auth.users), email, role (enum), full_name, avatar_url               |
| employees            | id, user_id (FK users), department_id (FK departments), employee_code, first_name, last_name, email, phone, position, salary, employment_date, status, profile_photo_url |
| leaves               | id, employee_id, leave_type, start_date, end_date, reason, status, reviewed_by, reviewed_at, review_notes |
| timesheets           | id, employee_id, work_date, clock_in, clock_out, regular_hours, overtime_hours, late_minutes |
| payroll              | id, employee_id, period_start, period_end, base_salary, overtime_pay, deductions, net_salary, status, paid_at |
| performance_reviews  | id, employee_id, reviewer_id, review_period_start, review_period_end, score, notes |
| meetings             | id, title, description, scheduled_at, duration_minutes, location, created_by |
| meeting_participants | id, meeting_id, user_id                                                     |
| notifications        | id, user_id, title, message, type, read_at, link                            |

## Enums

- **user_role**: admin, hr_manager, employee  
- **employee_status**: active, inactive  
- **leave_type**: annual, sick, unpaid, other  
- **leave_status**: pending, approved, rejected  

## Row Level Security (RLS)

See `supabase/migrations/002_rls_policies.sql`.

- **users**: read/update own row; insert own on signup; admin can do all.
- **departments**: authenticated read; admin/hr_manager manage.
- **employees**: employee read own; admin read all; HR read by department; admin/HR insert/update; admin delete.
- **leaves**: employee read/insert own; admin/HR read all and update (review).
- **timesheets**: employee read/insert/update own; admin/HR full access.
- **payroll**: employee read own; admin/HR full.
- **performance_reviews**: employee read own; admin/HR full.
- **meetings**: authenticated read/insert; creator update/delete.
- **meeting_participants**: read if participant or creator; creator manage.
- **notifications**: user read/update own; insert allowed for app/service.

Helper functions used in policies:

- `auth.user_role()` – current user’s role from `public.users`
- `auth.my_employee_id()` – current user’s employee id
- `auth.employee_department(emp_id)` – department of an employee
- `auth.can_manage_department(dept_id)` – true if admin or HR for that department
