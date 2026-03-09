'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface MeetingRow {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  office?: { name: string } | null;
}

export function MeetingsList({ meetings, offices }: { meetings: MeetingRow[], offices: { id: string; name: string }[] }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string>('all');

  const filteredMeetings = meetings.filter(m => {
    const matchesOffice = selectedOffice === 'all' || m.office?.name === selectedOffice;
    const matchesSearch = !globalFilter ||
      m.title.toLowerCase().includes(globalFilter.toLowerCase()) ||
      m.description?.toLowerCase().includes(globalFilter.toLowerCase());
    return matchesOffice && matchesSearch;
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.name}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9 w-full sm:w-[240px]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Office</th>
              <th className="px-4 py-3 text-left font-medium">When</th>
              <th className="px-4 py-3 text-left font-medium">Duration</th>
              <th className="px-4 py-3 text-left font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeetings.map((m) => (
              <tr key={m.id} className="border-b hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{m.title}</div>
                  {m.description && (
                    <div className="text-muted-foreground truncate max-w-xs">{m.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {m.office?.name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {new Date(m.scheduled_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{m.duration_minutes} min</td>
                <td className="px-4 py-3">{m.location ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMeetings.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No meetings found.</div>
        )}
      </div>
    </div>
  );
}
