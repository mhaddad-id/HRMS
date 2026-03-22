-- Migration: Add Two-Step Approval to Leaves Table
-- Created: 2026-03-18 23:45

-- 1. Add new columns
ALTER TABLE leaves
  ADD COLUMN IF NOT EXISTS manager_status leave_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS hr_status leave_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS manager_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hr_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS hr_at TIMESTAMPTZ;

-- 2. Initialize existing data
-- Any leave that is currently 'approved' should be marked as both manager and hr approved
UPDATE leaves
SET 
  manager_status = 'approved',
  hr_status = 'approved',
  hr_id = reviewed_by,
  hr_at = reviewed_at
WHERE status = 'approved';

-- Any leave that is currently 'rejected' should reflect that
UPDATE leaves
SET 
  manager_status = 'rejected',
  hr_status = 'rejected'
WHERE status = 'rejected';
