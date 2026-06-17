-- Migration: 010_add_sent_by_and_recipient_email_to_certificates.sql
-- Add tracking fields to certificates and update RLS to support email matching

-- 1. Add columns to event_certificates if they don't exist
ALTER TABLE event_certificates 
  ADD COLUMN IF NOT EXISTS recipient_email TEXT,
  ADD COLUMN IF NOT EXISTS sent_by_email TEXT;

-- 2. Create index on recipient_email for performance
CREATE INDEX IF NOT EXISTS event_certificates_recipient_email_idx ON event_certificates(recipient_email);

-- 3. Update the select policy for event_certificates
-- Drop existing policy first
DROP POLICY IF EXISTS "Allow users to read their certificates" ON event_certificates;

-- Re-create the select policy to allow reading if the attendee's name matches OR their email matches OR they are the organizer of the event
CREATE POLICY "Allow users to read their certificates" ON event_certificates
  FOR SELECT
  TO authenticated
  USING (
    participant_name = (SELECT current_setting('request.jwt.claims', true)::json->'user_metadata'->>'full_name')
    OR
    recipient_email = (SELECT current_setting('request.jwt.claims', true)::json->>'email')
    OR 
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_certificates.event_id
        AND events.organizer_id = auth.uid()
    )
  );
