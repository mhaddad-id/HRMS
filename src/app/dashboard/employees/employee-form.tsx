'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { employeeSchema, type EmployeeFormValues } from '@/lib/validations/employee';
import { createClient } from '@/lib/supabase/client';
import { createEmployee } from '@/app/actions/employees';
import type { Employee } from '@/lib/database.types';

interface EmployeeFormProps {
  employees: Pick<Employee, 'id' | 'first_name' | 'last_name'>[];
  initial?: Partial<EmployeeFormValues> & { id?: string };
  onSuccess?: () => void;
}

export function EmployeeForm({ employees, initial, onSuccess }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offices, setOffices] = useState<{ id: string; name: string }[]>([]);
  const isEdit = !!initial?.id;

  useEffect(() => {
    async function fetchOffices() {
      const supabase = createClient();
      const { data } = await supabase.from('offices').select('id, name').order('name');
      if (data) setOffices(data);
    }
    fetchOffices();
  }, []);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      password: '',
      first_name: initial?.first_name ?? '',
      last_name: initial?.last_name ?? '',
      identity_no: initial?.identity_no ?? '',
      email: initial?.email ?? '',
      phone: initial?.phone ?? '',
      father_name: initial?.father_name ?? '',
      mother_name: initial?.mother_name ?? '',
      date_of_birth: initial?.date_of_birth ?? '',
      address: initial?.address ?? '',
      emergency_contact: initial?.emergency_contact ?? '',
      position: initial?.position ?? '',
      office: initial?.office ?? '',
      office_id: initial?.office_id ?? null,
      supervisor_id: initial?.supervisor_id ?? null,
      salary: initial?.salary ?? 0,
      employment_date: initial?.employment_date ?? new Date().toISOString().slice(0, 10),
      ending_date: initial?.ending_date ?? '',
      supervisor: initial?.supervisor ?? '',
      annual_score: initial?.annual_score ?? 0,
      sick_score: initial?.sick_score ?? 0,
      competence_score: initial?.competence_score ?? 0,
      status: initial?.status ?? 'active',
    },
  });

  async function onSubmit(values: EmployeeFormValues) {
    setLoading(true);
    setError(null);

    if (isEdit) {
      const supabase = createClient();
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        identity_no: values.identity_no?.trim() ? values.identity_no.trim() : null,
        email: values.email,
        phone: values.phone || null,
        father_name: values.father_name?.trim() ? values.father_name.trim() : null,
        mother_name: values.mother_name?.trim() ? values.mother_name.trim() : null,
        date_of_birth: values.date_of_birth || null,
        address: values.address?.trim() ? values.address.trim() : null,
        emergency_contact: values.emergency_contact?.trim() ? values.emergency_contact.trim() : null,
        position: values.position,
        office: values.office || null,
        office_id: values.office_id || null,
        supervisor_id: values.supervisor_id || null,
        salary: values.salary,
        employment_date: values.employment_date,
        ending_date: values.ending_date || null,
        supervisor: values.supervisor?.trim() ? values.supervisor.trim() : null,
        annual_score: values.annual_score ?? 0,
        sick_score: values.sick_score ?? 0,
        competence_score: values.competence_score ?? 0,
        status: values.status,
      };

      const { error: e } = await supabase.from('employees').update(payload).eq('id', initial!.id);
      if (e) { setError(e.message); setLoading(false); return; }
    } else {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });
      const result = await createEmployee(formData);
      if (result.error) {
        setError(result.error);
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3 border border-destructive/20">{error}</div>
      )}

      {/* Row: Employee code + Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Employee Code</Label>
          <Input
            value={initial?.employee_code || 'Auto-generated (T0xxx)'}
            disabled
            readOnly
            className="bg-muted"
          />
        </div>
        {!isEdit && (
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" {...form.register('password')} placeholder="Secure password" />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Identity No</Label>
          <Input {...form.register('identity_no')} />
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

      {/* Row: First + Last name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...form.register('first_name')} placeholder="John" />
          {form.formState.errors.first_name && (
            <p className="text-sm text-destructive">{form.formState.errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...form.register('last_name')} placeholder="Doe" />
          {form.formState.errors.last_name && (
            <p className="text-sm text-destructive">{form.formState.errors.last_name.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Father Name</Label>
          <Input {...form.register('father_name')} />
        </div>
        <div className="space-y-2">
          <Label>Mother Name</Label>
          <Input {...form.register('mother_name')} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...form.register('email')} placeholder="john@company.com" />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input {...form.register('phone')} placeholder="+1 234 567 890" />
          {form.formState.errors.phone && (
            <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Emergency Contact</Label>
          <Input {...form.register('emergency_contact')} />
        </div>
        <div className="space-y-2">
          <Label>Date of Birth</Label>
          <Input type="date" {...form.register('date_of_birth')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Address</Label>
        <Textarea {...form.register('address')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Position</Label>
          <Input {...form.register('position')} placeholder="Software Engineer" />
          {form.formState.errors.position && (
            <p className="text-sm text-destructive">{form.formState.errors.position.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Office</Label>
          <Select
            value={form.watch('office_id') || 'none'}
            onValueChange={(v) => {
              const val = v === 'none' ? null : v;
              form.setValue('office_id', val);
              // Also sync the 'office' text field for backward compatibility
              const officeName = offices.find(o => o.id === val)?.name || '';
              form.setValue('office', officeName);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Supervisor */}
      <div className="space-y-2">
        <Label>Supervisor</Label>
        <Select
          value={form.watch('supervisor_id') || 'none'}
          onValueChange={(v) => form.setValue('supervisor_id', v === 'none' ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select supervisor (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {employees.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.first_name} {e.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row: Salary + Employment date */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Salary</Label>
          <Input
            type="number"
            step="0.01"
            {...form.register('salary', { valueAsNumber: true, setValueAs: (v) => (v === '' ? 0 : Number(v)) })}
            placeholder="0.00"
          />
          {form.formState.errors.salary?.message && (
            <p className="text-sm text-destructive">{form.formState.errors.salary.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Employment Date</Label>
          <Input type="date" {...form.register('employment_date')} />
          {form.formState.errors.employment_date?.message && (
            <p className="text-sm text-destructive">{form.formState.errors.employment_date.message}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Ending Date</Label>
          <Input type="date" {...form.register('ending_date')} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>Annual Score</Label>
          <Input
            type="number"
            step="1"
            {...form.register('annual_score', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? 0 : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>Sick Score</Label>
          <Input
            type="number"
            step="1"
            {...form.register('sick_score', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? 0 : Number(v)),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label>Competence Score</Label>
          <Input
            type="number"
            step="1"
            {...form.register('competence_score', {
              valueAsNumber: true,
              setValueAs: (v) => (v === '' ? 0 : Number(v)),
            })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? 'Saving…' : isEdit ? 'Update Employee' : 'Add Employee'}
        </Button>
      </div>
    </form >
  );
}
