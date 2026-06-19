-- FestForge: Dynamic Ticket Tiers

-- 1. Create the new ticket_tiers table
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('free', 'paid', 'early_bird', 'vip')),
  price INT NOT NULL DEFAULT 0 CHECK (price >= 0),
  capacity INT NOT NULL DEFAULT 100 CHECK (capacity >= 1),
  color_hex TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS ticket_tiers_event_id_idx ON ticket_tiers(event_id);

ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers manage tickets for own events" ON ticket_tiers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_tiers.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = ticket_tiers.event_id
        AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read ticket tiers" ON ticket_tiers
  FOR SELECT
  USING (true);

-- 2. Alter event_registrations to use ticket_tier_id instead of ticket_type
ALTER TABLE event_registrations DROP COLUMN IF EXISTS ticket_type;
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS ticket_tier_id UUID REFERENCES ticket_tiers(id) ON DELETE SET NULL;
