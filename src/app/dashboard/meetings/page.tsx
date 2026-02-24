import { createClient } from '@/lib/supabase/server';
import { MeetingsList } from './meetings-list';
import { CreateMeetingButton } from './create-meeting-button';

export default async function MeetingsPage() {
  const supabase = await createClient();
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at');

  const { data: users } = await supabase.from('users').select('id, full_name, email');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Schedule and view meetings</p>
        </div>
        <CreateMeetingButton users={users ?? []} />
      </div>
      <MeetingsList meetings={meetings ?? []} />
    </div>
  );
}
