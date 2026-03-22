'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateMeetingForm } from './create-meeting-form';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
}

interface Office {
  id: string;
  name: string;
}

export function CreateMeetingButton({
  users,
  offices,
}: {
  users: UserRow[];
  offices: Office[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg  h-10 px-6 font-bold transition-all hover:scale-105 active:scale-95">
          <Plus className="mr-2 h-5 w-5" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-[2rem] border border-white/10 dark:border-white/5 shadow-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-8 text-white">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                Schedule Meeting
              </DialogTitle>
            </DialogHeader>
            <p className="text-emerald-50/90 text-sm mt-3 font-medium max-w-sm leading-relaxed">
              Coordinate your team, pick a location, and secure a workspace in seconds.
            </p>
          </div>
          {/* Decorative geometric blur elements */}
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-400/30 blur-3xl"></div>
          <div className="absolute right-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-900/40 blur-3xl"></div>
        </div>
        <div className="p-8 pb-10 bg-background overflow-hidden relative border-t border-border/50">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <CreateMeetingForm users={users} offices={offices} onSuccess={() => setOpen(false)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

