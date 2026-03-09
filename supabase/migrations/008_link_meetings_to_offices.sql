-- =============================================
-- Migration 008: Link meetings to offices
-- =============================================

ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_meetings_office ON meetings(office_id);
