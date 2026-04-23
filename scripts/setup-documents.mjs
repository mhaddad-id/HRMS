/**
 * Script to apply employee_documents migration and create storage bucket
 * Run with: node scripts/setup-documents.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lhozrinsjirhzeydlvgg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxob3pyaW5zamlyaHpleWRsdmdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY5OTM3OSwiZXhwIjoyMDg3Mjc1Mzc5fQ.Z-0fuCbNxoA1d5y_53cZzwOnwkJkflQEXkVVxFz-BcY';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function run() {
  // Check if table exists
  console.log('🔄 Checking employee_documents table...');
  const { error } = await admin.from('employee_documents').select('id').limit(1);

  if (error && error.code === '42P01') {
    console.log('❌ Table does not exist. Please run the migration SQL in your Supabase SQL editor:');
    console.log('\n👉 Go to: https://supabase.com/dashboard/project/lhozrinsjirhzeydlvgg/sql/new\n');
    console.log('Then paste and run the content of: supabase/migrations/020_employee_documents.sql\n');
  } else {
    console.log('✅ Table employee_documents is ready.');
  }

  // Create storage bucket
  console.log('\n🪣 Creating employee-documents storage bucket...');
  const { error: bucketError } = await admin.storage.createBucket('employee-documents', {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
    ],
  });

  if (bucketError) {
    if (bucketError.message?.includes('already exists') || bucketError.message?.includes('duplicate')) {
      console.log('✅ Bucket employee-documents already exists.');
    } else {
      console.error('❌ Bucket error:', bucketError.message);
    }
  } else {
    console.log('✅ Bucket employee-documents created successfully!');
  }

  console.log('\n✅ Setup complete!');
}

run().catch(console.error);
