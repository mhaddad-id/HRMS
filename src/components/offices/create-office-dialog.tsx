'use client';

import { useState } from 'react';
import { createOffice } from '@/app/actions/offices';
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
import { Plus, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CreateOfficeDialog() {
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
      await createOffice({ name, address, working_hours_start, working_hours_end });
      toast({
        title: 'Success',
        description: 'Office created successfully',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create office',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg h-10 px-6 font-bold transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-5 w-5" />
          Add Office
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
        <div className="bg-emerald-600 p-8 text-white relative">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tight">New Office</DialogTitle>
          </DialogHeader>
          <p className="text-emerald-100/80 text-sm mt-2 font-medium">Add a new company location and set its working parameters.</p>
          <div className="absolute right-8 top-8 opacity-20">
            <Building2 className="h-16 w-16" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6 bg-background">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Office Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Dubai Main Office"
                required
                className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="working_hours_start" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Hour</Label>
                <Input
                  id="working_hours_start"
                  name="working_hours_start"
                  type="time"
                  defaultValue="09:00"
                  className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="working_hours_end" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Hour</Label>
                <Input
                  id="working_hours_end"
                  name="working_hours_end"
                  type="time"
                  defaultValue="17:00"
                  className="rounded-xl h-12 bg-muted/20 border-border/50 focus:bg-background transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Physical address or location coordinates..."
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
              {loading ? 'Creating...' : 'Create Office'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

  );
}
