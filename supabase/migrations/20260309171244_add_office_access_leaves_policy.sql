-- Allow employees with office access to read leaves for employees in those offices
CREATE POLICY "Employee read office leaves" ON leaves
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM office_access oa
      JOIN employees e ON e.office_id = oa.office_id
      WHERE oa.user_id = auth.uid() AND e.id = leaves.employee_id
    )
  );
