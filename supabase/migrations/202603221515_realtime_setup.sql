-- 1. Enable Realtime for the notifications table
alter publication supabase_realtime add table notifications;

-- 2. Allow users to receive their own notifications in real-time
alter table notifications enable row level security;

create policy "Users can view their own notifications"
  on notifications for select
  using (auth.uid() = user_id);
