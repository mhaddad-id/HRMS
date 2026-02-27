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
import { EmployeeForm } from './employee-form';
import type { Department } from '@/lib/database.types';

interface AddEmployeeButtonProps {
  departments: Pick<Department, 'id' | 'name' | 'code'>[];
}

export function AddEmployeeButton({ departments }: AddEmployeeButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        <EmployeeForm departments={departments} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
