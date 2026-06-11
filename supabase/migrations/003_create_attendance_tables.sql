-- Migration: 003_create_attendance_tables.sql
-- Integrates QR Geolocation-Verified Attendance into existing database

-- 1. Create Attendance Sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  radius_meters INT DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on sessions
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Organizers can manage sessions for their own events
CREATE POLICY "Organizers manage own event sessions" ON attendance_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendance_sessions.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Policy: Attendees can read active sessions
CREATE POLICY "Attendees view active sessions" ON attendance_sessions
  FOR SELECT USING (is_active = true AND expires_at > now());


-- 2. Create Attendance Records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  check_in_time TIMESTAMPTZ DEFAULT now(),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  distance_meters NUMERIC NOT NULL,
  status TEXT DEFAULT 'Present',
  device_information TEXT,
  ip_address TEXT,
  CONSTRAINT unique_user_event_attendance UNIQUE(user_id, event_id)
);

-- Enable RLS on records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Policy: Attendees can view their own check-in records
CREATE POLICY "Users view own attendance records" ON attendance_records
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Attendees can insert their own check-in record
CREATE POLICY "Users insert own attendance records" ON attendance_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Organizers can view check-in records for their events
CREATE POLICY "Organizers view event attendance records" ON attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendance_records.event_id
      AND events.organizer_id = auth.uid()
    )
  );


-- 3. Create Attendance Logs table (for security and audit trail)
CREATE TABLE IF NOT EXISTS attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID,
  status TEXT NOT NULL, -- e.g., 'Success', 'Failed_Expired', 'Failed_Radius', 'Failed_Auth'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  latitude NUMERIC,
  longitude NUMERIC,
  device_information TEXT,
  ip_address TEXT
);

-- Enable RLS on logs
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only organizers can view audit logs for their events
CREATE POLICY "Organizers view event audit logs" ON attendance_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = attendance_logs.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Policy: Anyone can insert into audit logs to register attempts
CREATE POLICY "Enable insert for all attempt logging" ON attendance_logs
  FOR INSERT WITH CHECK (true);
