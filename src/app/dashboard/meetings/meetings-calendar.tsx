'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  addDays,
  format,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Pin, Trash2, X, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeetingRow {
  id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  office?: { name: string } | null;
  organizer?: { full_name: string | null } | null;
  participants?: { user: { full_name: string | null } }[];
}

interface Office {
  id: string;
  name: string;
}

// Calendar constants
const HOUR_START = 9;   // 9 AM
const HOUR_END = 18;    // Show until 6 PM (includes 5 PM slots)
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 48; // px per 30-min slot
const TIME_COL_WIDTH = 72; // px

function generateTimeSlots() {
  const slots: string[] = [];
  for (let h = HOUR_START; h < HOUR_END; h++) {
    slots.push(`${h}:00`);
    if (h < HOUR_END - 1 || HOUR_END % 1 === 0) { // Keep consistency
      slots.push(`${h}:30`);
    }
  }
  return slots;
}

function formatTimeLabel(slot: string) {
  const [h, m] = slot.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${hour}:00 ${period}` : '';
}

function getEventStyle(meeting: MeetingRow) {
  const start = parseISO(meeting.scheduled_at);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const calStartMinutes = HOUR_START * 60;
  const offsetMinutes = startMinutes - calStartMinutes;
  const top = (offsetMinutes / SLOT_MINUTES) * SLOT_HEIGHT + 10;
  const height = Math.max((meeting.duration_minutes / SLOT_MINUTES) * SLOT_HEIGHT, SLOT_HEIGHT);
  return { top, height };
}

export function MeetingsCalendar({
  meetings,
  offices,
  userRole,
}: {
  meetings: MeetingRow[];
  offices: Office[];
  userRole: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [selectedOffice, setSelectedOffice] = useState<string>('all');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const timeSlots = generateTimeSlots();

  // Auto-scroll to ~9 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      const offset = ((9 * 60 - HOUR_START * 60) / SLOT_MINUTES) * SLOT_HEIGHT - 20;
      scrollRef.current.scrollTop = offset;
    }
  }, []);

  const filteredMeetings = meetings.filter((m) => {
    if (selectedOffice !== 'all' && m.office?.name !== selectedOffice) return false;
    return true;
  });

  function getMeetingsForDay(day: Date) {
    return filteredMeetings.filter((m) => isSameDay(parseISO(m.scheduled_at), day));
  }

  async function handleDelete(meetingId: string) {
    try {
      setIsDeleting(true);
      const supabase = createClient();
      const { error } = await supabase.from('meetings').delete().eq('id', meetingId);

      if (error) throw error;

      toast({
        title: 'Meeting deleted',
        description: 'The meeting has been successfully removed.',
      });

      setSelectedMeeting(null);
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error deleting meeting',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[600px] border shadow-xl rounded-2xl overflow-hidden bg-background/50 backdrop-blur-md">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Select value={selectedOffice} onValueChange={setSelectedOffice}>
            <SelectTrigger className="w-56 h-10 text-sm rounded-xl border-emerald-200/50 focus:ring-emerald-500/20">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-2xl">
              <SelectItem value="all">All Rooms / Offices</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.id} value={o.name}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-xl border">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-4 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-background shadow-sm"
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
          >
            TODAY
          </Button>
          <div className="h-4 w-px bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-background shadow-sm"
            onClick={() => setCurrentWeekStart((w) => subWeeks(w, 1))}
          >
            <ChevronLeft className="h-4 w-4 text-emerald-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-background shadow-sm"
            onClick={() => setCurrentWeekStart((w) => addWeeks(w, 1))}
          >
            <ChevronRight className="h-4 w-4 text-emerald-600" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div ref={scrollRef} className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-hide">
        {/* Day headers */}
        <div
          className="flex border-b flex-shrink-0 sticky top-0 z-30 bg-background/95 backdrop-blur-xl transition-all"
          style={{ paddingLeft: TIME_COL_WIDTH }}
        >
          {weekDays.map((day) => {
            const todayDay = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 text-center py-4 border-l first:border-l-0"
              >
                <div className={`text-xs font-bold tracking-widest mb-2 ${todayDay ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE').toUpperCase()}
                </div>
                <div
                  className={`text-xl font-black w-10 h-10 flex items-center justify-center mx-auto rounded-2xl shadow-sm transition-all ${todayDay
                    ? 'bg-emerald-600 text-white shadow-emerald-200 ring-1 ring-emerald-50'
                    : 'text-foreground hover:bg-muted/50'
                    }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scrollable time grid */}
        <div className="flex-1 relative">
          <div className="flex pt-3" style={{ minHeight: timeSlots.length * SLOT_HEIGHT + 24 }}>
            {/* Time labels column */}
            <div className="flex-shrink-0 relative border-r bg-muted/10" style={{ width: TIME_COL_WIDTH }}>
              {timeSlots.map((slot, i) => (
                <div
                  key={slot}
                  className="absolute right-4 text-[10px] font-black tracking-tighter text-muted-foreground/60"
                  style={{
                    top: i * SLOT_HEIGHT - 6,
                    width: TIME_COL_WIDTH - 16,
                    textAlign: 'right',
                    lineHeight: '1',
                  }}
                >
                  {formatTimeLabel(slot)}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayMeetings = getMeetingsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 border-l first:border-l-0 relative group/col"
                  style={{ minHeight: timeSlots.length * SLOT_HEIGHT + 24 }}
                >
                  {/* Slot lines */}
                  {timeSlots.map((slot, i) => (
                    <div
                      key={slot}
                      className={`absolute w-full border-t transition-colors ${i % 2 === 0 ? 'border-border/60' : 'border-border/30'
                        }`}
                      style={{ top: i * SLOT_HEIGHT }}
                    />
                  ))}

                  {/* Meeting events */}
                  {dayMeetings.map((m) => {
                    const { top, height } = getEventStyle(m);
                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMeeting(selectedMeeting?.id === m.id ? null : m)}
                        className="absolute left-1 right-1 rounded-xl text-left overflow-hidden z-20 group transition-all hover:scale-[1.02] hover:shadow-2xl hover:z-30 hover:ring-2 hover:ring-emerald-400 active:scale-95 shadow-lg"
                        style={{
                          top,
                          height: height - 2, // Tiny gap
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.15))',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderLeftWidth: '4px',
                          borderLeftColor: 'rgb(5, 150, 105)',
                        }}
                      >
                        <div className="px-2.5 py-2 flex flex-col h-full overflow-hidden">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="text-sm font-bold text-emerald-950 dark:text-emerald-50 leading-none truncate">
                              {m.title}
                            </span>
                            <Pin className="h-3 w-3 flex-shrink-0 text-emerald-800 rotate-45 group-hover:rotate-0 transition-transform" />
                          </div>
                          {m.location && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-800/80 dark:text-emerald-200 font-medium truncate">
                              <span className="opacity-50">@</span> {m.location}
                            </div>
                          )}
                          <div className="mt-auto flex items-center gap-1.5 pt-1 border-t border-emerald-500/10">
                            {m.participants && m.participants.length > 0 && (
                              <div className="flex -space-x-1.5 overflow-hidden">
                                {m.participants.slice(0, 3).map((_, idx) => (
                                  <div key={idx} className="h-4 w-4 rounded-full bg-emerald-500/20 border border-background flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-emerald-700">P</span>
                                  </div>
                                ))}
                                {m.participants.length > 3 && (
                                  <div className="h-4 w-4 rounded-full bg-muted border border-background flex items-center justify-center">
                                    <span className="text-[8px] font-bold">+{m.participants.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <span className="text-[10px] text-emerald-900 font-bold opacity-60">
                              {m.duration_minutes}m
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meeting detail popover */}
      {selectedMeeting && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="bg-card text-card-foreground rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-8 max-w-md w-full border border-border/50 animate-in zoom-in-95 slide-in-from-bottom-5 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-1">
                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50/50  dark:bg-emerald-900 dark:text-emerald-100 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                  Meeting Details
                </Badge>
                <h3 className="font-black text-3xl tracking-tight leading-tight pt-2">{selectedMeeting.title}</h3>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="p-2 rounded-2xl hover:bg-muted transition-all active:scale-90"
              >
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>

            {selectedMeeting.description && (
              <div className="mb-6 p-4 bg-muted/40 rounded-2xl border border-border/30 italic text-sm text-balance">
                "{selectedMeeting.description}"
              </div>
            )}

            <div className="grid gap-4 mb-8">
              <div className="flex items-center gap-4 group">
                <div className="p-2.5 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform">
                  <CalendarIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Date & Time</span>
                  <span className="font-semibold text-sm">
                    {new Date(selectedMeeting.scheduled_at).toLocaleString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-2.5 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform">
                  <Pin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Location / Room</span>
                  <span className="font-semibold text-sm">
                    {selectedMeeting.location || 'No virtual link'}
                    {selectedMeeting.office?.name && ` • ${selectedMeeting.office.name}`}
                  </span>
                </div>
              </div>

              {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                <div className="pt-4 border-t border-dashed">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">Participants ({selectedMeeting.participants.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMeeting.participants.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 bg-emerald-500/5 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 font-medium text-xs">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        {p.user.full_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-auto">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-12 font-bold transition-all hover:bg-muted"
                onClick={() => setSelectedMeeting(null)}
              >
                Close
              </Button>
              {userRole !== 'employee' && (
                <Button
                  variant="destructive"
                  className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-95"
                  disabled={isDeleting}
                  onClick={() => handleDelete(selectedMeeting.id)}
                >
                  {isDeleting ? (
                    'Deleting...'
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

