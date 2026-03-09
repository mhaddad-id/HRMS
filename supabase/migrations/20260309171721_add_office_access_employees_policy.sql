-- Allow employees with office access to read other employees in those offices
CREATE POLICY "Employee read office employees" ON employees
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM office_access oa
      WHERE oa.user_id = auth.uid() AND oa.office_id = employees.office_id
    )
  );
