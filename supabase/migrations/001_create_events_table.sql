-- FestForge: Create events table for organizer event management
-- Apply this migration in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Drop old table if it exists (to fix the broken foreign key constraint)
DROP TABLE IF EXISTS events;

CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  venue TEXT,
  category TEXT DEFAULT 'General',
  max_attendees INT DEFAULT 500,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: organizers can only manage their own events
CREATE POLICY "Users manage own events" ON events
  FOR ALL USING (auth.uid() = organizer_id);
