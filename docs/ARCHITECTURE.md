# HRMS System Architecture

## Overview

The Human Resources Management System (HRMS) is a full-stack web application built for small and medium-sized enterprises (SMEs). It follows a modern, modular architecture with clear separation between frontend, backend (Supabase), and data layer.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│  Next.js App Router │ React │ Tailwind │ Shadcn/UI │ TanStack    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Application (Vercel/Node)              │
│  • Server Components (data fetching)                             │
│  • API Routes (optional server-side logic)                       │
│  • Server Actions (auth, mutations)                              │
│  • Middleware (session refresh)                                  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase (BaaS)                              │
│  • PostgreSQL (data + RLS)                                        │
│  • Auth (JWT, email/password)                                    │
│  • Storage (profile photos, future PDFs)                         │
│  • Realtime (optional for notifications)                         │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer        | Technology        | Purpose                          |
|-------------|-------------------|----------------------------------|
| Frontend    | Next.js 14 (App Router) | Routing, SSR, server components |
| UI          | React 18, TypeScript    | Components and type safety       |
| Styling     | Tailwind CSS, Shadcn/UI | Responsive, accessible UI        |
| Forms       | React Hook Form + Zod   | Validation and UX                |
| Tables      | TanStack Table         | Sortable, filterable data tables |
| Charts      | Recharts               | Dashboard analytics              |
| Backend     | Supabase               | Auth, PostgreSQL, RLS           |
| Validation  | Zod                    | API and form validation          |

## Module Overview

1. **Authentication & Authorization**  
   Supabase Auth with email/password; JWT stored in HTTP-only cookies. Role stored in `public.users`. Protected routes via layout server-side check.

2. **Dashboard**  
   Server-rendered KPIs (employees, pending leaves, payroll summary, avg hours) and client-side Recharts for payroll-by-month and leaves-by-type.

3. **Employee Management**  
   CRUD with department assignment, position, salary, employment date, status. TanStack Table for list with search and pagination.

4. **Leave Management**  
   Employees submit leave (type, dates, reason). HR/Admin see all and approve/reject. RLS restricts employees to own leaves.

5. **Payroll**  
   Read-only list of payroll records (monthly calculation and PDF generation can be added via API routes or Supabase Edge Functions).

6. **Performance**  
   Performance reviews with score and notes; HR/Admin manage, employees view own.

7. **Timesheet**  
   Daily clock-in/out, regular and overtime hours, late minutes. Employees log own; HR/Admin see all via RLS.

8. **Meetings**  
   Create meetings with date/time, duration, location; assign participants (user IDs). List upcoming meetings.

9. **Notifications**  
   In-app notifications table; mark as read. Email can be added via Supabase Auth hooks or Edge Functions.

## Security Model

- **Authentication**: Supabase Auth (JWT in cookies via `@supabase/ssr`).
- **Authorization**: Row Level Security (RLS) on all tables. Policies keyed off `auth.uid()` and helper functions `auth.user_role()`, `auth.my_employee_id()`, `auth.can_manage_department()`.
- **Roles**: `admin` (full access), `hr_manager` (department-scoped where applicable), `employee` (own data only).
- **Validation**: Zod for server actions and API input.

## Data Flow

- **Server Components**: Fetch data in dashboard layout and pages with `createClient()` from `@/lib/supabase/server`. No RLS bypass; uses authenticated user.
- **Client Components**: Use `createClient()` from `@/lib/supabase/client` for mutations and realtime.
- **Server Actions**: Used for sign-in, sign-up, sign-out; create Supabase client per request and redirect on success.

## Scalability

- Stateless Next.js app; horizontal scaling on Vercel/Node.
- Supabase/PostgreSQL scales with plan; connection pooling built-in.
- Optional: Edge Functions for heavy or scheduled tasks (e.g. payroll run, email).

## Modularity

- Features are grouped under `/dashboard/<module>` with their own page, list/form components, and validations in `/lib/validations/`.
- Shared UI in `/components/ui/` and `/components/dashboard/`.
- Database schema in Supabase migrations; RLS in a dedicated migration.
