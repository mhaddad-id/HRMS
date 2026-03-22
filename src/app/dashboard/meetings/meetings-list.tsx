'use client';

import { useState } from 'react';
import { Search, MapPin, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
    <div className="space-y-6">
      <Card className="p-4 bg-background/50 backdrop-blur-sm border shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedOffice} onValueChange={setSelectedOffice}>
              <SelectTrigger className="w-full sm:w-[220px] h-10 rounded-xl">
                <SelectValue placeholder="All Rooms / Offices" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Rooms / Offices</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.name}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search meetings..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="flex h-10 w-full sm:w-[300px] rounded-xl border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b-2">
              <TableHead className="w-[300px] font-bold text-xs uppercase tracking-wider text-muted-foreground pl-6 py-4">Meeting Title</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4">Location</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4">Scheduled For</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4">Duration</TableHead>
              <TableHead className="text-right pr-6 font-bold text-xs uppercase tracking-wider text-muted-foreground py-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMeetings.map((m) => {
              const date = new Date(m.scheduled_at);
              const isPast = date < new Date();
              return (
                <TableRow key={m.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-base text-foreground group-hover:text-emerald-600 transition-colors">{m.title}</span>
                      {m.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px]">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {m.location || 'Virtual'}
                      </div>
                      {m.office && (
                        <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold uppercase py-0 px-2 h-5">
                          {m.office.name}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-mono text-sm font-black text-muted-foreground">
                    {m.duration_minutes}m
                  </TableCell>
                  <TableCell className="pr-6 text-right py-4">
                    <Badge
                      variant="secondary"
                      className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-tight shadow-sm ${isPast ? 'bg-muted text-muted-foreground' : 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                        }`}
                    >
                      {isPast ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filteredMeetings.length === 0 && (
          <div className="p-16 text-center space-y-3">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="text-lg font-bold text-foreground">No meetings found</div>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">Try adjusting your filters or search keywords to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}

