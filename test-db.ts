import { createAdminClient } from './src/lib/supabase/admin';

async function test() {
  const admin = createAdminClient();

  // check employees table
  const { data: employees } = await admin.from('employees').select('id, first_name, office, office_id').limit(5);
  console.log("Employees:", employees);

  // check office_access
  const { data: access } = await admin.from('office_access').select('*').limit(5);
  console.log("Office Access:", access);
}

test().catch(console.error);
