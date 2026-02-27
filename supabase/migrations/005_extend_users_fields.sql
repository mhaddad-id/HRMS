-- =============================================
-- Extend public.users with profile fields
-- =============================================

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS supervisor VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_users_supervisor ON public.users(supervisor);
