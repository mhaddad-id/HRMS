'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  uploadEmployeeDocument,
  getEmployeeDocuments,
  deleteEmployeeDocument,
  getDocumentDownloadUrl,
} from '@/app/actions/documents';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Trash2,
  Download,
  FolderOpen,
  Loader2,
  X,
  UploadCloud,
} from 'lucide-react';
import type { EmployeeDocument } from '@/lib/database.types';

const FILE_CATEGORIES = [
  { value: 'personal', label: 'Personal Document', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'contract', label: 'Contract', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'jd', label: 'Job Description', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'certificate', label: 'Certificate', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
];

function getCategoryStyle(type: string) {
  return FILE_CATEGORIES.find(c => c.value === type)?.color ?? FILE_CATEGORIES[4].color;
}

function getCategoryLabel(type: string) {
  return FILE_CATEGORIES.find(c => c.value === type)?.label ?? 'Other';
}

function getFileIcon(mimeType: string | null, fileName: string) {
  if (mimeType?.startsWith('image/')) return <FileImage className="h-5 w-5 text-pink-500" />;
  if (mimeType?.includes('spreadsheet') || fileName.match(/\.(xlsx?|csv)$/i)) return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
  if (mimeType?.includes('pdf') || fileName.match(/\.pdf$/i)) return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType?.includes('word') || fileName.match(/\.docx?$/i)) return <FileText className="h-5 w-5 text-blue-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface EmployeeDocumentsDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
}

export function EmployeeDocumentsDialog({
  open,
  onOpenChangeAction,
  employeeId,
  employeeName,
}: EmployeeDocumentsDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState('personal');
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    const result = await getEmployeeDocuments(employeeId);
    if (result.data) {
      setDocuments(result.data as EmployeeDocument[]);
    }
    setLoading(false);
  }, [employeeId]);

  // Load documents when dialog opens
  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open, loadDocuments]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChangeAction(isOpen);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('employee_id', employeeId);
      formData.append('file_type', fileType);

      const result = await uploadEmployeeDocument(formData);

      if (result.error) {
        toast({
          title: 'Upload Failed',
          description: `${file.name}: ${result.error}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Uploaded',
          description: `${file.name} uploaded successfully.`,
        });
      }
    }

    setUploading(false);
    loadDocuments();

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    const result = await getDocumentDownloadUrl(doc.storage_path);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }
    if (result.url) {
      window.open(result.url, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteEmployeeDocument(deleteId);
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Document removed successfully.' });
      loadDocuments();
    }
    setDeleteId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const filteredDocuments = filterType === 'all'
    ? documents
    : documents.filter(d => d.file_type === filterType);

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <FolderOpen className="h-4 w-4 text-white" />
              </div>
              {employeeName}&apos;s Documents
            </DialogTitle>
            <DialogDescription>
              Upload and manage personal files, contracts, job descriptions, and certificates.
            </DialogDescription>
          </DialogHeader>

          {/* Upload Area */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={fileType} onValueChange={setFileType}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="default"
                size="sm"
                className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Files'}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif,.webp,.txt"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
                ${dragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 scale-[1.01]'
                  : 'border-muted-foreground/20 hover:border-muted-foreground/40 bg-muted/30'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className={`h-8 w-8 mx-auto mb-2 transition-colors ${dragOver ? 'text-blue-500' : 'text-muted-foreground/50'}`} />
              <p className="text-sm text-muted-foreground">
                {dragOver ? (
                  <span className="text-blue-500 font-medium">Drop files here...</span>
                ) : (
                  <>
                    Drag & drop files here, or <span className="text-blue-500 font-medium underline underline-offset-2">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                PDF, Word, Excel, Images — Max 10MB per file
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <span className="text-xs font-medium text-muted-foreground mr-1">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${filterType === 'all'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
            >
              All ({documents.length})
            </button>
            {FILE_CATEGORIES.map((cat) => {
              const count = documents.filter(d => d.file_type === cat.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.value}
                  onClick={() => setFilterType(cat.value)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${filterType === cat.value
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pt-1 pr-1 -mr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">No documents yet</p>
                <p className="text-xs text-muted-foreground">Upload files to get started.</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/50 transition-all duration-150 hover:shadow-sm"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    {getFileIcon(doc.mime_type, doc.file_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${getCategoryStyle(doc.file_type)}`}>
                        {getCategoryLabel(doc.file_type)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
                      onClick={() => handleDownload(doc)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      onClick={() => setDeleteId(doc.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChangeAction={(o) => { if (!o) setDeleteId(null); }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirmAction={handleDelete}
      />
    </>
  );
}
