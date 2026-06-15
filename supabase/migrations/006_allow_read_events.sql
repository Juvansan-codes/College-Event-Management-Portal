-- Allow anyone (authenticated or anonymous) to view events so attendees can see upcoming events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);
