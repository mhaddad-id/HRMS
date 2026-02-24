'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { employeeSchema, type EmployeeFormValues } from '@/lib/validations/employee';
import { createClient } from '@/lib/supabase/client';
import type { Department } from '@/lib/database.types';

interface EmployeeFormProps {
  departments: Pick<Department, 'id' | 'name' | 'code'>[];
  initial?: Partial<EmployeeFormValues> & { id?: string };
  onSuccess?: () => void;
}

export function EmployeeForm({
  departments,
  initial,
  onSuccess,
}: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!initial?.id;

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_code: initial?.employee_code ?? '',
      first_name: initial?.first_name ?? '',
      last_name: initial?.last_name ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      department_id: initial?.department_id ?? null,
      position: initial?.position ?? '',
      salary: initial?.salary ?? 0,
      employment_date: initial?.employment_date ?? new Date().toISOString().slice(0, 10),
      status: initial?.status ?? 'active',
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const payload = {
      employee_code: values.employee_code,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email,
      phone: values.phone || null,
      department_id: values.department_id || null,
      position: values.position,
      salary: values.salary,
      employment_date: values.employment_date,
      status: values.status,
    };
    if (isEdit) {
      const { error: e } = await supabase.from('employees').update(payload).eq('id', initial!.id);
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: e } = await supabase.from('employees').insert(payload);
      if (e) {
        setError(e.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    router.refresh();
    onSuccess?.();
    form.reset();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Employee code</Label>
          <Input {...form.register('employee_code')} disabled={isEdit} />
          {form.formState.errors.employee_code && (
            <p className="text-sm text-destructive">{form.formState.errors.employee_code.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(v) => form.setValue('status', v as 'active' | 'inactive')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input {...form.register('first_name')} />
          {form.formState.errors.first_name && (
            <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input {...form.register('last_name')} />
          {form.formState.errors.last_name && (
            <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input {...form.register('phone')} />
      </div>
      <div className="space-y-2">
        <Label>Department</Label>
        <Select
          value={form.watch('department_id') ?? ''}
          onValueChange={(v) => form.setValue('department_id', v || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Position</Label>
        <Input {...form.register('position')} />
        {form.formState.errors.position && (
          <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Salary</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register('salary', { valueAsNumber: true })}
          />
          {form.formState.errors.salary && (
            <p className="text-sm text-destructive">{form.formState.errors.salary.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Employment date</Label>
          <Input type="date" {...form.register('employment_date')} />
          {form.formState.errors.employment_date && (
            <p className="text-sm text-destructive">
              {form.formState.errors.employment_date.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
}
