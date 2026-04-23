'use server';

import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET_NAME = 'employee-documents';

// Guess MIME type from file extension when browser doesn't provide one
function guessMimeType(fileName: string, browserMime: string): string {
  if (browserMime && browserMime !== 'application/octet-stream') return browserMime;
  const ext = fileName.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  };
  return map[ext ?? ''] ?? 'application/octet-stream';
}

export async function uploadEmployeeDocument(formData: FormData) {
  const admin = createAdminClient();

  const file = formData.get('file') as File;
  const employeeId = formData.get('employee_id') as string;
  const fileType = (formData.get('file_type') as string) || 'other';

  if (!file || !employeeId) {
    return { error: 'File and employee ID are required.' };
  }

  if (!file.name) {
    return { error: 'Invalid file: no name detected.' };
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { error: 'File size must be less than 10MB.' };
  }

  // Resolve MIME type (Windows often returns empty or generic types)
  const mimeType = guessMimeType(file.name, file.type);

  // Create a unique storage path
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${employeeId}/${fileType}/${timestamp}_${safeName}`;

  // Convert to Buffer (more reliable than Uint8Array in Next.js server actions)
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await admin.storage
    .from(BUCKET_NAME)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
      duplex: 'half',
    } as any);

  if (uploadError) {
    console.error('[Documents] Storage upload error:', uploadError);
    return { error: `Upload failed: ${uploadError.message}` };
  }

  // Get the signed URL (1 year expiry for storage reference — actual access uses fresh signed URLs)
  const { data: urlData } = admin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  // Insert record into employee_documents table
  const { error: insertError } = await admin
    .from('employee_documents')
    .insert({
      employee_id: employeeId,
      file_name: file.name,
      file_type: fileType,
      file_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: mimeType,
      storage_path: storagePath,
    });

  if (insertError) {
    // Cleanup uploaded file if DB insert fails
    await admin.storage.from(BUCKET_NAME).remove([storagePath]);
    console.error('[Documents] DB insert error:', insertError);
    return { error: `Saved record failed: ${insertError.message}` };
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function getEmployeeDocuments(employeeId: string) {
  noStore();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from('employee_documents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Documents] Fetch error:', error);
    return { error: `Failed to load documents: ${error.message}`, data: [] };
  }

  return { data: data ?? [], error: null };
}

export async function deleteEmployeeDocument(documentId: string) {
  const admin = createAdminClient();

  // Get the storage path first
  const { data: doc, error: fetchError } = await admin
    .from('employee_documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();

  if (fetchError || !doc) {
    return { error: 'Document not found.' };
  }

  // Delete from storage
  const { error: storageError } = await admin.storage
    .from(BUCKET_NAME)
    .remove([doc.storage_path]);

  if (storageError) {
    console.error('[Documents] Storage delete error:', storageError);
    // Continue to delete the record anyway
  }

  // Delete from database
  const { error: deleteError } = await admin
    .from('employee_documents')
    .delete()
    .eq('id', documentId);

  if (deleteError) {
    return { error: `Failed to delete document: ${deleteError.message}` };
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function getDocumentDownloadUrl(storagePath: string) {
  const admin = createAdminClient();

  const { data, error } = await admin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 60 * 60); // 1 hour expiry

  if (error) {
    console.error('[Documents] Signed URL error:', error);
    return { error: 'Failed to generate download link.' };
  }

  return { url: data.signedUrl };
}
