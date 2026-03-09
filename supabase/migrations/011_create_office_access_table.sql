-- =============================================
-- Migration 011: Create office_access table for granular permissions
-- =============================================

-- 1. Create office_access table
CREATE TABLE IF NOT EXISTS office_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT false,
  can_view_payroll BOOLEAN DEFAULT false,
  can_view_vacations BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, office_id)
);

-- 2. Create index for performance
CREATE INDEX IF NOT EXISTS idx_office_access_user ON office_access(user_id);
CREATE INDEX IF NOT EXISTS idx_office_access_office ON office_access(office_id);

-- 3. Enable RLS
ALTER TABLE office_access ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for office_access
-- Admins can do anything
CREATE POLICY "Admins can manage office_access"
  ON office_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- HR Managers can view all access records and manage them
CREATE POLICY "HR Managers can manage office_access"
  ON office_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'hr_manager'
    )
  );

-- Users can view their own access
CREATE POLICY "Users can view their own office_access"
  ON office_access
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Updated_at trigger
CREATE TRIGGER office_access_updated_at BEFORE UPDATE ON office_access
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- 6. Grant access to service role for backend operations
GRANT ALL ON office_access TO service_role;
GRANT ALL ON office_access TO authenticated;
