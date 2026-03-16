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

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
}

interface Office {
  id: string;
  name: string;
}

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
    }

    setLoading(false);
    onSuccess?.();
    router.refresh();
  }

  function toggleParticipant(id: string) {
    setParticipants((p: string[]) => (p.includes(id) ? p.filter((x: string) => x !== id) : [...p, id]));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date &amp; Time</Label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Duration (min)</Label>
          <Input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Location</Label>
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Room / Office</Label>
        <Select value={officeId} onValueChange={setOfficeId}>
          <SelectTrigger>
            <SelectValue placeholder="Select room (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No room</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Participants</Label>

        {/* Selected Participants Badges */}
        {participants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border min-h-[42px]">
            {participants.map((id) => {
              const user = users.find((u) => u.id === id);
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="flex items-center gap-1.5 px-2 py-0.5 animate-in zoom-in-95"
                >
                  <span className="max-w-[120px] truncate">{user?.full_name || user?.email}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => toggleParticipant(id)}
                  />
                </Badge>
              );
            })}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2 bg-background shadow-inner">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <label
                key={u.id}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all hover:bg-muted ${participants.includes(u.id) ? 'bg-muted/60' : ''
                  }`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-primary"
                  checked={participants.includes(u.id)}
                  onChange={() => toggleParticipant(u.id)}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {u.full_name || 'No Name'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{u.email}</span>
                </div>
              </label>
            ))
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground italic">
              No participants found
            </div>
          )}
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1e2d5a] hover:bg-[#16234a] text-white"
      >
        {loading ? 'Creating...' : 'Create Meeting'}
      </Button>
    </form>
  );
}
