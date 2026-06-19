-- FestForge: Dynamic Sponsor Packages

-- 1. Create the new sponsor_packages table
CREATE TABLE IF NOT EXISTS sponsor_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INT NOT NULL DEFAULT 0 CHECK (price >= 0),
  slots INT NOT NULL DEFAULT 1 CHECK (slots >= 1),
  color_hex TEXT DEFAULT '#6C5CE7',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS sponsor_packages_event_id_idx ON sponsor_packages(event_id);

ALTER TABLE sponsor_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers manage packages for own events" ON sponsor_packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = sponsor_packages.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = sponsor_packages.event_id
        AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read sponsor packages" ON sponsor_packages
  FOR SELECT
  USING (true);

-- 2. Alter event_sponsors to use package_id instead of tier
-- Drop existing constraints
ALTER TABLE event_sponsors DROP CONSTRAINT IF EXISTS event_sponsors_tier_check;

-- We don't want to lose existing data completely if we don't have to, but since this is 
-- local dev and tier is heavily coupled, we'll just drop `tier` and add `package_id`.
ALTER TABLE event_sponsors DROP COLUMN IF EXISTS tier;
ALTER TABLE event_sponsors ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES sponsor_packages(id) ON DELETE SET NULL;

-- Note: Because we made tier NOT NULL previously, dropping it is safe, 
-- but package_id can be NULL if a package is deleted.
