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
import { ChevronLeft, ChevronRight, Pin, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const top = (offsetMinutes / SLOT_MINUTES) * SLOT_HEIGHT;
  const height = Math.max((meeting.duration_minutes / SLOT_MINUTES) * SLOT_HEIGHT, SLOT_HEIGHT);
  return { top, height };
}

export function MeetingsCalendar({
  meetings,
  offices,
}: {
  meetings: MeetingRow[];
  offices: Office[];
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
    <div className="flex flex-col h-full min-h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card flex-shrink-0">
        <Select value={selectedOffice} onValueChange={setSelectedOffice}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Select Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Select Room</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.name}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="default"
          size="sm"
          className="h-9 bg-[#1e2d5a] hover:bg-[#16234a] text-white px-4"
          onClick={() => setSelectedOffice('all')}
        >
          Show All
        </Button>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs font-semibold border rounded"
            onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
          >
            TODAY
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentWeekStart((w) => subWeeks(w, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentWeekStart((w) => addWeeks(w, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Day headers */}
        <div
          className="flex border-b flex-shrink-0"
          style={{ paddingLeft: TIME_COL_WIDTH }}
        >
          {weekDays.map((day) => {
            const todayDay = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 text-center py-2 border-l"
              >
                <div className="text-xs text-muted-foreground font-medium">
                  {format(day, 'EEE').toUpperCase()}
                </div>
                <div
                  className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${todayDay
                    ? 'bg-blue-600 text-white'
                    : 'text-foreground'
                    }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* All Day row */}
        <div className="flex border-b flex-shrink-0" style={{ minHeight: 48 }}>

          <div
            className="flex-shrink-0 border-r flex items-center justify-end pr-2 text-xs text-muted-foreground mb-2"
            style={{ width: TIME_COL_WIDTH }}
          >
            All Day
          </div>

          {weekDays.map((day) => (
            <div key={day.toISOString()} className="flex-1 border-l" />
          ))}
        </div>


        {/* Scrollable time grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto relative bg-background">
          <div className="flex" style={{ minHeight: timeSlots.length * SLOT_HEIGHT }}>
            {/* Time labels column */}
            <div className="flex-shrink-0 relative border-r" style={{ width: TIME_COL_WIDTH }}>
              {timeSlots.map((slot, i) => (
                <div
                  key={slot}
                  className="absolute right-2 text-xs text-muted-foreground"
                  style={{
                    top: i * SLOT_HEIGHT - 8,
                    width: TIME_COL_WIDTH - 8,
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
                  className="flex-1 border-l relative"
                  style={{ minHeight: timeSlots.length * SLOT_HEIGHT }}
                >
                  {/* Slot lines */}
                  {timeSlots.map((slot, i) => (
                    <div
                      key={slot}
                      className={`absolute w-full border-t ${i % 2 === 0 ? 'border-border' : 'border-border/50'
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
                        className="absolute left-1 right-1 rounded text-left overflow-hidden z-10 group transition-all hover:ring-2 hover:ring-orange-400"
                        style={{
                          top,
                          height,
                          background: 'rgba(250, 164, 130, 0.95)',
                          border: '1px solid rgba(220, 120, 80, 0.6)',
                        }}
                      >
                        <div className="px-1.5 py-1 flex flex-col h-full overflow-hidden">
                          <div className="flex items-start justify-between gap-1">
                            <span className="text-lg font-semibold text-orange-950 leading-tight truncate">
                              {m.title}
                            </span>
                            <Pin className="h-3 w-3 flex-shrink-0 text-orange-800 mt-1" />
                          </div>
                          {m.location && (
                            <span className="text-[15px] text-orange-900 truncate">
                              {m.location}
                            </span>
                          )}
                          {m.participants && m.participants.length > 0 && (
                            <div className="mt-auto pt-1 bg-orange-200/50 -mx-1.5 px-1.5">
                              <span className="text-[12px] text-orange-950 font-medium truncate block">
                                {m.participants.map(p => p.user.full_name).join(', ')}
                              </span>
                            </div>
                          )}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedMeeting(null)}
        >
          <div
            className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-bold text-xl leading-tight">{selectedMeeting.title}</h3>
              <button
                onClick={() => setSelectedMeeting(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedMeeting.description && (
              <p className="text-sm text-muted-foreground mb-4 border-l-2 pl-3 py-1">
                {selectedMeeting.description}
              </p>
            )}

            <div className="space-y-3 text-sm mb-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold w-20 text-muted-foreground">When:</span>
                <span>
                  {new Date(selectedMeeting.scheduled_at).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold w-20 text-muted-foreground">Duration:</span>
                <span>{selectedMeeting.duration_minutes} min</span>
              </div>
              {selectedMeeting.location && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-20 text-muted-foreground">Location:</span>
                  <span>{selectedMeeting.location}</span>
                </div>
              )}
              {selectedMeeting.office?.name && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-20 text-muted-foreground">Room:</span>
                  <span>{selectedMeeting.office.name}</span>
                </div>
              )}

              {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="font-semibold text-muted-foreground block mb-2">Participants:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMeeting.participants.map((p, i) => (
                      <span key={i} className="bg-primary/10 text-primary text-[11px] px-2.5 py-0.5 rounded-full border border-primary/20">
                        {p.user.full_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
              disabled={isDeleting}
              onClick={() => handleDelete(selectedMeeting.id)}
            >
              {isDeleting ? (
                'Deleting...'
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete Meeting
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
