'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MonthPicker } from '@/components/ui/month-picker';

export interface LeaveOfficeOption {
  id: string;
  name: string;
}

export function LeaveControls({
  officeId,
  offices,
  month,
}: {
  officeId?: string;
  offices: LeaveOfficeOption[];
  month: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setParams = (next: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v) params.delete(k);
      else params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };


  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">Month:</div>
        <MonthPicker
          value={month}
          onValueChangeAction={(v) => setParams({ month: v })}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">Office:</div>
        <Select
          value={officeId || ''}
          onValueChange={(v) => setParams({ office: v })}
        >
          <SelectTrigger className="w-[180px] h-10 rounded-xl bg-background border-muted text-sm font-medium">
            <SelectValue placeholder="Select an office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
