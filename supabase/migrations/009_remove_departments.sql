-- =============================================
-- Migration 009: Remove Departments
-- =============================================

-- 1. Drop the departments table and references
-- First, drop the FK on employees if it exists
ALTER TABLE employees DROP COLUMN IF EXISTS department_id;

-- 2. Drop the departments table
DROP TABLE IF EXISTS departments CASCADE;

-- 3. Drop RLS helper functions that use department_id
DROP FUNCTION IF EXISTS public.get_employee_department(UUID);
DROP FUNCTION IF EXISTS public.can_manage_department(UUID);

-- 4. Re-create RLS policies for employees without department logic
-- We need to update the policies defined in 002_rls_policies.sql
-- specifically the "HR read department employees" policy.

DROP POLICY IF EXISTS "HR read department employees" ON employees;
CREATE POLICY "HR read all employees" ON employees
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() = 'hr_manager'
  );

-- Also update can_manage_department if it's used elsewhere (it was used in the policy above)
-- Since we dropped it, we are safe.
