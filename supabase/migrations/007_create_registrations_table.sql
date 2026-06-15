-- Migration: 007_create_registrations_table.sql
-- Handles attendee registrations for events

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Registered',
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_event_registration UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Attendees can insert their own registration
CREATE POLICY "Users register themselves" ON event_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Attendees can view their own registrations
CREATE POLICY "Users view own registrations" ON event_registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Organizers can view registrations for their own events
CREATE POLICY "Organizers view event registrations" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_registrations.event_id
      AND events.organizer_id = auth.uid()
    )
  );
