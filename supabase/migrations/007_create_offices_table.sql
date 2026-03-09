-- =============================================
-- Migration 007: Create offices table and link to employees
-- =============================================

-- 1. Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Seed offices from existing employees data
INSERT INTO offices (name)
SELECT DISTINCT office 
FROM employees 
WHERE office IS NOT NULL AND office <> ''
ON CONFLICT (name) DO NOTHING;

-- 3. Add office_id to employees
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS office_id UUID REFERENCES offices(id) ON DELETE SET NULL;

-- 4. Update employees.office_id based on office name
UPDATE employees
SET office_id = offices.id
FROM offices
WHERE employees.office = offices.name;

-- 5. Create index for performance
CREATE INDEX IF NOT EXISTS idx_employees_office ON employees(office_id);

-- Optional: You may want to keep the 'office' column for a while or drop it
-- ALTER TABLE employees DROP COLUMN office;
