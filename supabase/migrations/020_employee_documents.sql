-- Employee Documents table for storing personal files, contracts, JDs, etc.
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'other',  -- 'personal', 'contract', 'jd', 'certificate', 'other'
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by employee
CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);

-- Enable RLS
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;

-- Policies: admin and hr_manager can manage all documents
CREATE POLICY "Admin and HR can manage all documents"
  ON employee_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'hr_manager')
    )
  );

-- Employees can view their own documents
CREATE POLICY "Employees can view own documents"
  ON employee_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees WHERE employees.id = employee_documents.employee_id AND employees.user_id = auth.uid()
    )
  );
