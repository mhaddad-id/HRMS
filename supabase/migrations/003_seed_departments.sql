-- Seed default departments (idempotent)
INSERT INTO departments (id, name, code, description) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Engineering', 'ENG', 'Software and hardware development'),
  ('a0000000-0000-0000-0000-000000000002', 'Human Resources', 'HR', 'HR and administration'),
  ('a0000000-0000-0000-0000-000000000003', 'Finance', 'FIN', 'Finance and accounting'),
  ('a0000000-0000-0000-0000-000000000004', 'Operations', 'OPS', 'Operations and logistics')
ON CONFLICT (id) DO NOTHING;
