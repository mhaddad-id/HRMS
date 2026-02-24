-- =============================================
-- Row Level Security (RLS) Policies
-- Admin: full access | HR: department scope | Employee: own data
-- =============================================

-- Helper: get current user's role (in public schema - auth schema is not writable by migrations)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's employee id
CREATE OR REPLACE FUNCTION public.get_my_employee_id()
RETURNS UUID AS $$
  SELECT id FROM employees WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get employee's department (for HR scope)
CREATE OR REPLACE FUNCTION public.get_employee_department(emp_id UUID)
RETURNS UUID AS $$
  SELECT department_id FROM employees WHERE id = emp_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: is current user HR or Admin for a department
CREATE OR REPLACE FUNCTION public.can_manage_department(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    LEFT JOIN employees e ON e.user_id = u.id
    WHERE u.id = auth.uid()
    AND (
      u.role = 'admin'
      OR (u.role = 'hr_manager' AND (e.department_id = dept_id OR dept_id IS NULL))
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========== USERS ==========
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own" ON public.users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can all users" ON public.users
  FOR ALL USING (public.get_user_role() = 'admin');

-- User can insert own row on signup (id = auth.uid())
CREATE POLICY "User insert own on signup" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ========== DEPARTMENTS ==========
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read departments" ON departments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin HR manage departments" ON departments
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- ========== EMPLOYEES ==========
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee read own" ON employees
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin read all employees" ON employees
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "HR read department employees" ON employees
  FOR SELECT TO authenticated
  USING (
    public.get_user_role() = 'hr_manager'
    AND public.can_manage_department(department_id) = true
  );

CREATE POLICY "Admin HR insert employees" ON employees
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Admin HR update employees" ON employees
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Admin delete employees" ON employees
  FOR DELETE USING (public.get_user_role() = 'admin');

-- ========== LEAVES ==========
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee read own leaves" ON leaves
  FOR SELECT USING (employee_id = public.get_my_employee_id());

CREATE POLICY "Employee insert own leave" ON leaves
  FOR INSERT WITH CHECK (employee_id = public.get_my_employee_id());

CREATE POLICY "Admin HR read all leaves" ON leaves
  FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('admin', 'hr_manager'));

CREATE POLICY "Admin HR update leaves (review)" ON leaves
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- ========== TIMESHEETS ==========
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee read own timesheets" ON timesheets
  FOR SELECT USING (
    employee_id = public.get_my_employee_id()
    OR public.get_user_role() IN ('admin', 'hr_manager')
  );

CREATE POLICY "Employee insert own timesheet" ON timesheets
  FOR INSERT WITH CHECK (employee_id = public.get_my_employee_id());

CREATE POLICY "Employee update own timesheet" ON timesheets
  FOR UPDATE USING (employee_id = public.get_my_employee_id());

CREATE POLICY "HR Admin all timesheets" ON timesheets
  FOR ALL USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- ========== PAYROLL ==========
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee read own payroll" ON payroll
  FOR SELECT USING (employee_id = public.get_my_employee_id());

CREATE POLICY "Admin HR full payroll" ON payroll
  FOR ALL USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- ========== PERFORMANCE REVIEWS ==========
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee read own reviews" ON performance_reviews
  FOR SELECT USING (employee_id = public.get_my_employee_id());

CREATE POLICY "Admin HR full performance" ON performance_reviews
  FOR ALL USING (public.get_user_role() IN ('admin', 'hr_manager'));

-- ========== MEETINGS ==========
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read meetings" ON meetings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated create meeting" ON meetings
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Creator update delete meeting" ON meetings
  FOR ALL USING (created_by = auth.uid());

-- ========== MEETING PARTICIPANTS ==========
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own participants" ON meeting_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    meeting_id IN (SELECT id FROM meetings WHERE created_by = auth.uid())
  );

CREATE POLICY "Meeting creator manage participants" ON meeting_participants
  FOR ALL USING (
    meeting_id IN (SELECT id FROM meetings WHERE created_by = auth.uid())
  );

-- ========== NOTIFICATIONS ==========
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User read own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "User update own (mark read)" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service and app create notifications" ON notifications
  FOR INSERT WITH CHECK (true);
