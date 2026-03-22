import { createClient } from '@/lib/supabase/server';
import { CalendarDays, List, Calendar as CalendarIcon } from 'lucide-react';
import { MeetingsCalendar } from './meetings-calendar';
import { MeetingsList } from './meetings-list';
import { CreateMeetingButton } from './create-meeting-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function MeetingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single();

  const userRole = profile?.role || 'employee';

  // Fetch all meetings (past + future) with participants and office info
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, office:offices(name), participants:meeting_participants(user:users(full_name))')
    .order('scheduled_at');

  const { data: offices } = await supabase.from('offices').select('id, name').order('name');
  const { data: users } = await supabase.from('users').select('id, full_name, email');

  return (
    <div className="flex flex-col gap-6 h-full p-6 bg-muted/30">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
            <CalendarDays className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Meetings
            </h1>
            <p className="text-muted-foreground font-medium">Schedule and manage company meetings</p>
          </div>
        </div>
        {userRole !== 'employee' && (
          <CreateMeetingButton users={users ?? []} offices={offices ?? []} />
        )}
      </div>

      <Tabs defaultValue="calendar" className="w-full flex-1 flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-background/50 border backdrop-blur-sm p-1">
            <TabsTrigger value="calendar" className="flex items-center gap-2 px-4 py-2">
              <CalendarIcon className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2 px-4 py-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="flex-1 mt-0">
          <MeetingsCalendar meetings={meetings ?? []} offices={offices ?? []} userRole={userRole} />
        </TabsContent>
        <TabsContent value="list" className="flex-1 mt-0">
          <MeetingsList meetings={meetings ?? []} offices={offices ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

