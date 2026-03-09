-- =============================================
-- User Account Management & Employee Code
-- =============================================

-- 1. Remove pay_no from employees table
ALTER TABLE employees DROP COLUMN IF EXISTS pay_no;

-- 2. Create sequence for employee_code generation
CREATE SEQUENCE IF NOT EXISTS employee_code_seq START 1;

-- 3. Create function to generate employee code (Format: T0xxx)
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TRIGGER AS $$
DECLARE
    next_val INT;
    new_code VARCHAR;
BEGIN
    IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
        LOOP
            SELECT nextval('employee_code_seq') INTO next_val;
            -- Format to T0 + 3 digit zero-padded string (e.g., T0001, T0015, T0999)
            -- Note: If sequence goes beyond 999, it will generate T01000, which is still unique.
            new_code := 'T0' || lpad(next_val::TEXT, 3, '0');
            
            -- Check if it exists just to be safe (though sequence should prevent this unless manually inserted)
            EXIT WHEN NOT EXISTS (SELECT 1 FROM employees WHERE employee_code = new_code);
        END LOOP;
        
        NEW.employee_code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically generate employee_code before insert
-- Drop it first in case it exists to avoid errors on re-runs
DROP TRIGGER IF EXISTS set_employee_code_trigger ON employees;

CREATE TRIGGER set_employee_code_trigger
BEFORE INSERT ON employees
FOR EACH ROW
EXECUTE FUNCTION generate_employee_code();

-- 5. Note: We keep identity_no as it might be a government ID, and the prompt only asked to remove pay_no.
