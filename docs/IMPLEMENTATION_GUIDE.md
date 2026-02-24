# Step-by-Step Implementation Guide

## Folder Structure

```
hrms/
├── src/
│   ├── app/
│   │   ├── actions/          # Server actions (auth)
│   │   ├── auth/             # Auth callback route
│   │   ├── dashboard/         # Protected app
│   │   │   ├── employees/
│   │   │   ├── leave/
│   │   │   ├── meetings/
│   │   │   ├── notifications/
│   │   │   ├── payroll/
│   │   │   ├── performance/
│   │   │   ├── timesheet/
│   │   │   ├── layout.tsx    # Auth check + shell
│   │   │   └── page.tsx      # Dashboard home
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── dashboard/        # Shell, charts
│   │   └── ui/              # Shadcn-style components
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/        # Client, server, middleware
│   │   ├── validations/     # Zod schemas
│   │   ├── database.types.ts
│   │   └── utils.ts
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_departments.sql
├── docs/
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Implementation Order

### Phase 1: Foundation

1. **Project init** – Next.js, TypeScript, Tailwind, dependencies (see `package.json`).
2. **Supabase** – Create project, add `.env.local`, implement `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`.
3. **Database** – Run `001_initial_schema.sql`, then `002_rls_policies.sql`, then `003_seed_departments.sql`.
4. **Auth** – Login/register pages, server actions (signIn, signUp, signOut), auth callback route. On signup, insert into `public.users` with role.
5. **Protected layout** – `dashboard/layout.tsx` fetches user and profile; redirect to `/login` if unauthenticated. Pass user to `DashboardShell`.
6. **Shell** – Sidebar nav (role-based), theme toggle, sign out. Link to `/dashboard`, `/dashboard/employees`, etc.

### Phase 2: Core Modules

7. **Dashboard** – Server component fetches counts (employees, pending leaves, payroll sum, timesheets). Cards for KPIs. Client component `DashboardCharts` fetches payroll-by-month and leaves-by-type, renders Recharts.
8. **Employees** – List page with server-side fetch; TanStack Table with search and pagination. Add-employee dialog with form (React Hook Form + Zod). Edit/delete in table; RLS enforces HR/Admin.
9. **Leave** – Request-leave form (employee); list with status. HR/Admin see all and get Approve/Reject buttons; server action or client mutation updates status and `reviewed_by`/`reviewed_at`.
10. **Payroll** – Read-only table from `payroll`; optional later: API route or Edge Function to compute and insert payroll, and generate PDF.

### Phase 3: Additional Modules

11. **Performance** – List performance reviews; add form (HR/Admin) to insert into `performance_reviews` with employee_id, period, score, notes.
12. **Timesheet** – List own timesheets; “Log hours” dialog (date, clock in/out), upsert into `timesheets`. RLS allows employee to insert/update own.
13. **Meetings** – List upcoming meetings; “Create meeting” form (title, description, datetime, duration, location, participants). Insert `meetings` and `meeting_participants`.
14. **Notifications** – List notifications for current user; “Mark read” updates `read_at`. Create notifications from server actions (e.g. on leave approval) or Edge Functions.

### Phase 4: Polish

15. **Profile photo** – Optional: upload to Supabase Storage, set `users.avatar_url` or `employees.profile_photo_url`; show in shell and employee form.
16. **Email** – Optional: Supabase Auth hooks + Edge Function or API route for leave/payroll emails.
17. **Payroll PDF** – Optional: API route that generates PDF (e.g. with `@react-pdf/renderer` or similar) and returns or stores in Storage.

## Core Code References

- **Auth (server action)** – `src/app/actions/auth.ts`: `signIn`, `signUp`, `signOut`; use `await createClient()` from server; redirect on success.
- **Protected layout** – `src/app/dashboard/layout.tsx`: `getUser()`, redirect if !user, fetch `users` profile, render `DashboardShell`.
- **RLS helpers** – `supabase/migrations/002_rls_policies.sql`: `public.get_user_role()`, `public.get_my_employee_id()`, `public.can_manage_department()` (in `public` schema; policies use `auth.uid()` for current user).
- **Validation** – `src/lib/validations/auth.ts`, `employee.ts`, `leave.ts`: Zod schemas; use in forms with `@hookform/resolvers/zod`.
- **Forms** – e.g. `EmployeeForm`: `useForm` + `zodResolver(employeeSchema)`, submit via Supabase client in client component or via server action.

## Testing Roles

1. Register three users; in DB set roles to `admin`, `hr_manager`, `employee`.
2. For `employee`, create an `employees` row with `user_id` = that user’s id.
3. As admin: full access. As HR: same as admin for most modules (department-scoped where implemented). As employee: only own leave, timesheet, payroll, performance, notifications; can request leave and log timesheet.

## Thesis / Academic Notes

- **Architecture**: Document the three-tier flow (client → Next.js → Supabase) and the use of RLS for authorization.
- **Security**: Describe RBAC, RLS policies, and Zod validation.
- **Scalability**: Stateless app, connection pooling, optional Edge Functions.
- **Modularity**: Per-module folders, shared UI and validations.
