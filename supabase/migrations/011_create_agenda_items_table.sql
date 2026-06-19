-- FestForge: Agenda items for organizer schedule planning
-- Each agenda item belongs to an event and a specific day number within that event.

CREATE TABLE IF NOT EXISTS agenda_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  day_number INT NOT NULL DEFAULT 1 CHECK (day_number >= 1),
  time_label TEXT NOT NULL,           -- e.g. '09:00 AM'
  hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
  title TEXT NOT NULL,
  speaker TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Talk' CHECK (category IN ('Workshop', 'Talk', 'Panel', 'Break', 'Competition')),
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS agenda_items_event_id_idx ON agenda_items(event_id);
CREATE INDEX IF NOT EXISTS agenda_items_event_day_idx ON agenda_items(event_id, day_number);

ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;

-- Organizers can fully manage agenda items for their own events
CREATE POLICY "Organizers manage agenda items for own events" ON agenda_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = agenda_items.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = agenda_items.event_id
        AND events.organizer_id = auth.uid()
    )
  );

-- Attendees can view agenda items for events they can see
CREATE POLICY "Anyone can read agenda items" ON agenda_items
  FOR SELECT
  USING (true);
