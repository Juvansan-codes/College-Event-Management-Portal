-- Migration: 005_create_polls_tables.sql
-- Creates polls, poll_options, and poll_votes tables with RLS and constraints.

-- 1. Create Polls Table
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  is_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on Polls
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view polls
CREATE POLICY "Anyone view polls" ON polls
  FOR SELECT USING (true);

-- Policy: Authenticated users can insert/update polls (organizers manage them)
CREATE POLICY "Organizers manage polls" ON polls
  FOR ALL USING (auth.role() = 'authenticated');


-- 2. Create Poll Options Table
CREATE TABLE IF NOT EXISTS poll_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL
);

-- Enable RLS on Poll Options
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view options
CREATE POLICY "Anyone view poll options" ON poll_options
  FOR SELECT USING (true);

-- Policy: Organizers manage options
CREATE POLICY "Organizers manage poll options" ON poll_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_options.poll_id
    )
  );


-- 3. Create Poll Votes Table
-- This table enforces one-person-one-vote constraint through UNIQUE(poll_id, user_id)
-- Each user can only vote once per poll
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- CONSTRAINT: Ensures each user can vote only once per poll (one-person-one-vote)
  CONSTRAINT unique_user_poll_vote UNIQUE(poll_id, user_id)
);

-- Enable RLS on Poll Votes
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view vote counts (or votes table)
CREATE POLICY "Anyone view poll votes" ON poll_votes
  FOR SELECT USING (true);

-- Policy: Authenticated users can cast their vote
CREATE POLICY "Users cast own votes" ON poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
