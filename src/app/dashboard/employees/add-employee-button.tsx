'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { EmployeeForm } from './employee-form';
import type { Employee } from '@/lib/database.types';

interface AddEmployeeButtonProps {
  employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
}

export function AddEmployeeButton({ employees }: AddEmployeeButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Enter the details of the new employee below.
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm employees={employees} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
