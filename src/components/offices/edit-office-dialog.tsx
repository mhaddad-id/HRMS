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
import { Edit2, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OfficeWithCount {
  id: string;
  name: string;
  address: string | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  employee_count: number;
}

interface EditOfficeDialogProps {
  office: OfficeWithCount;
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
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text  -3xl font-black tracking-tight flex items-center gap-3">
              Edit Office
            </DialogTitle>
          </DialogHeader>
          <p className="text-emerald-100/80 text-sm mt-2 font-medium">Update the details for <span className="text-white font-bold">{office.name}</span>.</p>
          <div className="absolute right-8 top-8 opacity-20">
            <Edit2 className="h-16 w-16" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6 bg-background">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Office Name</Label>
              <Input
                id="edit-name"
                name="name"
                defaultValue={office.name}
                required
                className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="edit-working_hours_start" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Hour</Label>
                <Input
                  id="edit-working_hours_start"
                  name="working_hours_start"
                  type="time"
                  defaultValue={office.working_hours_start || '09:00'}
                  className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-working_hours_end" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Hour</Label>
                <Input
                  id="edit-working_hours_end"
                  name="working_hours_end"
                  type="time"
                  defaultValue={office.working_hours_end || '17:00'}
                  className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-address" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</Label>
              <Textarea
                id="edit-address"
                name="address"
                defaultValue={office.address || ''}
                placeholder="Physical address..."
                className="rounded-xl min-h-[120px] bg-muted/20 border-border/50 focus:bg-background transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold transition-all hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

