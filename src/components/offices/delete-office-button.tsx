'use client';

import { deleteOffice } from '@/app/actions/offices';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DeleteOfficeButtonProps {
  id: string;
}

export function DeleteOfficeButton({ id }: DeleteOfficeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={async () => {
        if (confirm('Are you sure you want to delete this office? This action cannot be undone.')) {
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
        }
      }}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
