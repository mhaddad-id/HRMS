import { createClient } from '@/lib/supabase/server';
import { MeetingsCalendar } from './meetings-calendar';
import { CreateMeetingButton } from './create-meeting-button';

export default async function MeetingsPage() {
  const supabase = await createClient();

  // Fetch all meetings (past + future) with participants and office info
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, office:offices(name), participants:meeting_participants(user:users(full_name))')
    .order('scheduled_at');

  const { data: offices } = await supabase.from('offices').select('id, name').order('name');
  const { data: users } = await supabase.from('users').select('id, full_name, email');

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold">Meetings</h1>
          <p className="text-muted-foreground">Schedule and view meetings</p>
        </div>
        <CreateMeetingButton users={users ?? []} offices={offices ?? []} />
      </div>
      <MeetingsCalendar meetings={meetings ?? []} offices={offices ?? []} />
    </div>
  );
}
