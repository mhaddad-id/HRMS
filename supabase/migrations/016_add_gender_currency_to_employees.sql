-- Add gender and currency to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
