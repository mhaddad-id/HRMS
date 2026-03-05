-- =============================================
-- Migration 004: Add office and supervisor_id to employees
-- =============================================

-- Add office field to employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS office VARCHAR(100);

-- Add supervisor_id (self-referencing FK) to employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_employees_supervisor ON employees(supervisor_id);
