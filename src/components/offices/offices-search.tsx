'use client';

import { useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OfficeCard } from './office-card';
import { CreateOfficeDialog } from './create-office-dialog';

interface OfficeWithCount {
  id: string;
  name: string;
  address: string | null;
  working_hours_start: string | null;
  working_hours_end: string | null;
  employee_count: number;
  created_at?: string | null;
}

interface OfficesSearchProps {
  offices: OfficeWithCount[];
}

export function OfficesSearch({ offices }: OfficesSearchProps) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? offices.filter((o) =>
      o.name.toLowerCase().includes(query.toLowerCase())
    )
    : offices;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="relative w-full sm:w-[350px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search offices, locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl focus:bg-background transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filtered.map((office) => (
            <OfficeCard key={office.id} office={office} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-background/40 border border-dashed rounded-3xl">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/40 animate-pulse">
            <Building2 className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <div className="text-center space-y-1">
            {query ? (
              <>
                <p className="font-bold text-lg text-foreground">No offices match &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-muted-foreground">Try a different search term or clear the filter.</p>
              </>
            ) : (
              <>
                <p className="font-bold text-lg text-foreground">No offices yet</p>
                <p className="text-sm text-muted-foreground">Create your first office to get started.</p>
                <div className="pt-4">
                  <CreateOfficeDialog />
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
