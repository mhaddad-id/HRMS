'use client';

import { Building2, MapPin, Clock, Sun, Moon, Users } from 'lucide-react';
import { OfficePermissions } from './office-permissions';
import { EditOfficeDialog } from './edit-office-dialog';
import { DeleteOfficeButton } from './delete-office-button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface OfficeCardProps {
  office: {
    id: string;
    name: string;
    address: string | null;
    working_hours_start: string | null;
    working_hours_end: string | null;
    employee_count: number;
    created_at?: string | null;
  };
}

function getWorkingHoursIcon(start: string | null) {
  if (!start) return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  const hour = parseInt(start.slice(0, 2), 10);
  if (hour >= 6 && hour < 18) return <Sun className="w-3.5 h-3.5 text-amber-400" />;
  return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
}

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

export function OfficeCard({ office }: OfficeCardProps) {
  const startDisplay = office.working_hours_start?.slice(0, 5) ?? '09:00';
  const endDisplay = office.working_hours_end?.slice(0, 5) ?? '17:00';

  return (
    <TooltipProvider delayDuration={200}>
      <Card className="group relative flex flex-col rounded-3xl border shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-background/50 backdrop-blur-md">
        {/* Gradient header strip */}
        <div className="relative h-24 bg-gradient-to-br from-emerald-600 via-emerald-500/5 to-teal-500/10 flex items-center px-6 gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 shadow-sm transition-transform group-hover:scale-110">
            <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl text-foreground tracking-tight truncate group-hover:text-emerald-600 transition-colors">
              {office.name}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <MapPin className="h-3 w-3" /> Office Location
            </div>
          </div>
        </div>

        {/* Body */}
        <CardContent className="flex flex-col gap-4 p-6 flex-1">
          {/* Working Hours */}
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-background shadow-sm border">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Working Hours</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                {getWorkingHoursIcon(office.working_hours_start)}
                {startDisplay} – {endDisplay}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-muted/10 border border-transparent hover:border-border/40 transition-all">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 shrink-0 mt-0.5 shadow-xs border border-border/20">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Address</span>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed line-clamp-3">
                {office.address || 'Global Headquarters / Not Specified'}
              </p>
            </div>
          </div>
        </CardContent>

        {/* Action strip */}
        <CardFooter className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/20 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="transition-transform hover:scale-110 active:scale-90">
                <OfficePermissions office={office} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl font-bold text-[10px] uppercase">Permissions</TooltipContent>
          </Tooltip>

          <div className="h-6 w-px bg-border/50 mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="transition-transform hover:scale-110 active:scale-90">
                <EditOfficeDialog office={office} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl font-bold text-[10px] uppercase">Edit</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="transition-transform hover:scale-110 active:scale-90">
                <DeleteOfficeButton id={office.id} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="rounded-xl font-bold text-[10px] uppercase bg-destructive text-destructive-foreground">Delete</TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}

