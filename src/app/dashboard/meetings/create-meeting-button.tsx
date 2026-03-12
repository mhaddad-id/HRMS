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
        <Button className="bg-[#1e2d5a] hover:bg-[#16234a] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Create Meeting
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Meeting</DialogTitle>
        </DialogHeader>
        <CreateMeetingForm users={users} offices={offices} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
