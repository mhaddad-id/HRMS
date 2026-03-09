-- =============================================
-- Migration 012: Add working hours to offices
-- =============================================

ALTER TABLE offices
  ADD COLUMN IF NOT EXISTS working_hours_start TIME DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS working_hours_end TIME DEFAULT '17:00';
