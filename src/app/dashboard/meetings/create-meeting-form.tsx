'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { sendMeetingInvitationEmail } from '@/app/actions/emails';
import { createNotification } from '@/app/actions/notifications';
import { useToast } from '@/hooks/use-toast';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
}

interface Office {
  id: string;
  name: string;
}

import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users as UsersIcon } from 'lucide-react';

export function CreateMeetingForm({
  users,
  offices,
  onSuccess,
}: {
  users: UserRow[];
  offices: Office[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [officeId, setOfficeId] = useState<string>('none');
  const [participants, setParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower)
    );
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: meeting } = await supabase
      .from('meetings')
      .insert({
        title,
        description: description || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        location: location || null,
        office_id: officeId !== 'none' ? officeId : null,
        created_by: user?.id,
      })
      .select('id')
      .single();

    if (meeting && participants.length > 0) {
      await supabase
        .from('meeting_participants')
        .insert(participants.map((user_id: string) => ({ meeting_id: meeting.id, user_id })));

      const selectedUsers = participants
        .map((id) => users.find((u) => u.id === id))
        .filter(Boolean) as UserRow[];

      const emailLocation =
        location ||
        (officeId !== 'none' ? offices.find((o) => o.id === officeId)?.name : 'Virtual / No specific room');

      await Promise.allSettled(
        selectedUsers.map((u) =>
          sendMeetingInvitationEmail({
            to: u.email,
            recipientName: u.full_name || 'Team member',
            meetingTitle: title,
            scheduledAt: new Date(scheduledAt).toISOString(),
            duration,
            location: emailLocation || 'Virtual',
          })
        )
      );

      // Create in-app notification for each participant
      await Promise.allSettled(
        participants.map((user_id: string) =>
          createNotification({
            userId: user_id,
            title: 'New Meeting Scheduled',
            message: `You have been added to: ${title} at ${new Date(scheduledAt).toLocaleString()}`,
            type: 'info',
            link: '/dashboard/meetings',
          })
        )
      );
    }

    setLoading(false);
    toast({
      title: 'Meeting Scheduled!',
      description: 'The meeting was created and participants have been notified.',
    });
    onSuccess?.();
    router.refresh();
  }

  function toggleParticipant(id: string) {
    setParticipants((p: string[]) => (p.includes(id) ? p.filter((x: string) => x !== id) : [...p, id]));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5 group">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-emerald-600 transition-colors">Meeting Title</Label>
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Strategy session..."
                className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 group">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-emerald-600 transition-colors">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this meeting about?"
              className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 group">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5 group-focus-within:text-emerald-600 transition-colors">
                <Calendar className="h-3 w-3" /> Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-1.5 group">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5 group-focus-within:text-emerald-600 transition-colors">
                <Clock className="h-3 w-3" /> Duration (min)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 group">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5 group-focus-within:text-emerald-600 transition-colors">
              <MapPin className="h-3 w-3" /> Location
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Zoom link or physical address"
              className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5 group">
            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 group-focus-within:text-emerald-600 transition-colors">Room / Office</Label>
            <Select value={officeId} onValueChange={setOfficeId}>
              <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-border/50 focus:bg-background focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">
                <SelectValue placeholder="Select room (optional)" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-xl border-border/50">
                <SelectItem value="none">No specific room</SelectItem>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id} className="rounded-xl m-1">
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                <UsersIcon className="h-3 w-3" /> Participants ({participants.length})
              </Label>
              {participants.length > 0 && (
                <button
                  type="button"
                  onClick={() => setParticipants([])}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-tight"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Selected Participants Badges */}
            <div className="flex flex-wrap gap-1.5 p-3 bg-muted/10 rounded-2xl border min-h-[56px] items-center">
              {participants.length > 0 ? (
                participants.map((id) => {
                  const user = users.find((u) => u.id === id);
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-muted/50 border-emerald-100 text-emerald-900 animate-in zoom-in-95 rounded-full shadow-sm"
                    >
                      <span className="max-w-[120px] truncate text-[11px] font-bold">{user?.full_name || user?.email}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                        onClick={() => toggleParticipant(id)}
                      />
                    </Badge>
                  );
                })
              ) : (
                <p className="text-[11px] text-muted-foreground font-medium px-2 italic">Select people to invite</p>
              )}
            </div>

            {/* Search and User List */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Invite colleagues..."
                  className="pl-10 h-11 rounded-xl bg-muted/10 border-border/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="h-[200px] overflow-y-auto rounded-2xl border border-border/40 p-1 bg-muted/5 custom-scrollbar dark:custom-scrollbar-dark">
                <div className="space-y-1 pr-3">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <label
                        key={u.id}
                        htmlFor={`user-${u.id}`}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all hover:bg-white dark:hover:bg-muted/50 group ${participants.includes(u.id) ? 'bg-white dark:bg-muted/30 shadow-sm border-transparent' : 'border-transparent'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-black">
                            {u.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold leading-none">
                              {u.full_name || 'No Name'}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{u.email}</span>
                          </div>
                        </div>
                        <Checkbox
                          id={`user-${u.id}`}
                          checked={participants.includes(u.id)}
                          onCheckedChange={() => toggleParticipant(u.id)}
                          className="rounded-md border-emerald-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-none"
                        />
                      </label>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[11px] text-muted-foreground font-medium italic">
                      No matching colleagues found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-95"
        >
          {loading ? 'Scheduling...' : 'Create Meeting'}
        </Button>
      </div>
    </form>
  );
}

