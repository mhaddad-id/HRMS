'use client';

import { useState } from 'react';
import { deleteOffice } from '@/app/actions/offices';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface DeleteOfficeButtonProps {
  id: string;
}

export function DeleteOfficeButton({ id }: DeleteOfficeButtonProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteOffice(id);
      toast({
        title: 'Success',
        description: 'Office deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete office. It might be linked to existing employees.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-destructive rounded-xl transition-all"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>


      <ConfirmDialog
        open={open}
        onOpenChangeAction={setOpen}
        title="Delete Office"
        description="Are you sure you want to delete this office? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirmAction={handleDelete}
      />
    </>
  );
}
