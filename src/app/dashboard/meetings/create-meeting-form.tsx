'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

interface UserRow {
  id: string;
  full_name: string | null;
  email: string;
}

export function CreateMeetingForm({
  users,
  onSuccess,
}: {
  users: UserRow[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: meeting } = await supabase
      .from('meetings')
      .insert({
        title,
        description: description || null,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        location: location || null,
        created_by: user?.id,
      })
      .select('id')
      .single();
    if (meeting && participants.length > 0) {
      await supabase.from('meeting_participants').insert(
        participants.map((user_id) => ({ meeting_id: meeting.id, user_id }))
      );
    }
    setLoading(false);
    onSuccess?.();
    router.refresh();
  }

  function toggleParticipant(id: string) {
    setParticipants((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
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
          <Label>Date & time</Label>
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
        <Label>Participants</Label>
        <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={participants.includes(u.id)}
                onChange={() => toggleParticipant(u.id)}
              />
              <span className="text-sm">{u.full_name || u.email}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
