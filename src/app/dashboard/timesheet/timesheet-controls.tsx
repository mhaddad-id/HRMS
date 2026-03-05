'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TimesheetEmployeeOption {
  id: string;
  label: string;
  status?: 'active' | 'inactive' | string | null;
}

export function TimesheetControls({
  month,
  employeeId,
  employees,
  status,
}: {
  month: string; // YYYY-MM
  employeeId?: string;
  employees: TimesheetEmployeeOption[];
  status?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const canPickEmployee = employees.length > 1;

  const setParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const selected = useMemo(
    () => employees.find((e) => e.id === employeeId) ?? null,
    [employees, employeeId]
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between print:hidden">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Month</div>
          <Input
            type="month"
            value={month}
            onChange={(e) => setParams({ month: e.target.value })}
            className="w-[11rem]"
          />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Employee</div>
          <Select
            value={employeeId ?? ''}
            onValueChange={(v) => setParams({ employee: v || undefined })}
            disabled={!canPickEmployee}
          >
            <SelectTrigger className="w-[18rem]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Status</div>
          <Input value={status ?? selected?.status ?? '—'} disabled className="w-[11rem]" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          Print
        </Button>
      </div>
    </div>
  );
}

