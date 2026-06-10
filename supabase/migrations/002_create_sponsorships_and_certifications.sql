-- FestForge: sponsorship and certification persistence

CREATE TABLE IF NOT EXISTS event_sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('Platinum', 'Gold', 'Silver')),
  amount INT NOT NULL DEFAULT 0 CHECK (amount >= 0),
  contact_email TEXT NOT NULL,
  pipeline_stage TEXT NOT NULL DEFAULT 'Contacted' CHECK (pipeline_stage IN ('Contacted', 'Proposal', 'Negotiating', 'Confirmed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS event_sponsors_event_id_idx ON event_sponsors(event_id);

ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers manage sponsors for own events" ON event_sponsors
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sponsors.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_sponsors.event_id
        AND events.organizer_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS sponsor_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  interested_tier TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor inquiries" ON sponsor_inquiries
  FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS certificate_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL UNIQUE REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  conducted_date DATE NOT NULL,
  template_data_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS certificate_batches_event_id_idx ON certificate_batches(event_id);

ALTER TABLE certificate_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers manage certificate batches for own events" ON certificate_batches
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = certificate_batches.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = certificate_batches.event_id
        AND events.organizer_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS event_certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES certificate_batches(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS event_certificates_batch_id_idx ON event_certificates(batch_id);
CREATE INDEX IF NOT EXISTS event_certificates_event_id_idx ON event_certificates(event_id);

ALTER TABLE event_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers manage certificates for own events" ON event_certificates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_certificates.event_id
        AND events.organizer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_certificates.event_id
        AND events.organizer_id = auth.uid()
    )
  );
