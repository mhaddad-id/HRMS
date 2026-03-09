'use client';

import { useState } from 'react';
import { updateOffice } from '@/app/actions/offices';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditOfficeDialogProps {
  office: {
    id: string;
    name: string;
    address: string | null;
    working_hours_start: string | null;
    working_hours_end: string | null;
  };
}

export function EditOfficeDialog({ office }: EditOfficeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const working_hours_start = formData.get('working_hours_start') as string;
    const working_hours_end = formData.get('working_hours_end') as string;

    try {
      await updateOffice(office.id, { 
        name, 
        address, 
        working_hours_start, 
        working_hours_end 
      });
      toast({
        title: 'Success',
        description: 'Office updated successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update office',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Office - {office.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Office Name</Label>
            <Input id="edit-name" name="name" defaultValue={office.name} required className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-working_hours_start">Start Hour</Label>
              <Input 
                id="edit-working_hours_start" 
                name="working_hours_start" 
                type="time" 
                defaultValue={office.working_hours_start || '09:00'} 
                className="h-9" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-working_hours_end">End Hour</Label>
              <Input 
                id="edit-working_hours_end" 
                name="working_hours_end" 
                type="time" 
                defaultValue={office.working_hours_end || '17:00'} 
                className="h-9" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-address">Address</Label>
            <Textarea 
              id="edit-address" 
              name="address" 
              defaultValue={office.address || ''} 
              className="min-h-[100px] resize-none" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-9 px-4">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-9 px-4">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
