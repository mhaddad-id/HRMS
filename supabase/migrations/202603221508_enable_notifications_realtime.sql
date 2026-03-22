-- Enable Realtime for the notifications table
alter publication supabase_realtime add table notifications;

-- (Optional) If you want to listen to specific columns only, you'd configure it here.
-- But the above is usually sufficient for standard Realtime.
