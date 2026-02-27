-- =============================================
-- Extend payroll with additional fields for UI
-- =============================================

ALTER TABLE payroll
  ADD COLUMN IF NOT EXISTS worked_days INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leave_without_pay DECIMAL(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

CREATE INDEX IF NOT EXISTS idx_payroll_worked_days ON payroll(worked_days);
