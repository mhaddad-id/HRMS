-- =============================================
-- Extend employees table with additional HR fields
-- =============================================

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS pay_no VARCHAR(50),
  ADD COLUMN IF NOT EXISTS identity_no VARCHAR(50),
  ADD COLUMN IF NOT EXISTS father_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS mother_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(100),
  ADD COLUMN IF NOT EXISTS ending_date DATE,
  ADD COLUMN IF NOT EXISTS supervisor VARCHAR(255),
  ADD COLUMN IF NOT EXISTS office VARCHAR(100),
  ADD COLUMN IF NOT EXISTS annual_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sick_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS competence_score INT DEFAULT 0;

-- Optional uniqueness (uncomment if you want strict uniqueness)
-- CREATE UNIQUE INDEX IF NOT EXISTS employees_pay_no_key ON employees(pay_no);
-- CREATE UNIQUE INDEX IF NOT EXISTS employees_identity_no_key ON employees(identity_no);

CREATE INDEX IF NOT EXISTS idx_employees_pay_no ON employees(pay_no);
CREATE INDEX IF NOT EXISTS idx_employees_identity_no ON employees(identity_no);
