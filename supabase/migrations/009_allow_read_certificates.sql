-- Migration: 009_allow_read_certificates.sql
-- Allow attendees to read certificate batches and their certificates

-- Allow anyone authenticated to read certificate batches
CREATE POLICY "Allow authenticated users to read certificate batches" ON certificate_batches
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to read their own certificates (matched by name)
CREATE POLICY "Allow users to read their certificates" ON event_certificates
  FOR SELECT
  TO authenticated
  USING (
    participant_name = (SELECT current_setting('request.jwt.claims', true)::json->'user_metadata'->>'full_name')
    OR 
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_certificates.event_id
        AND events.organizer_id = auth.uid()
    )
  );
