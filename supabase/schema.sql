-- ── VYBE Database Schema ──────────────────────────────────────────
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor → New query)

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text UNIQUE NOT NULL,
  email      text,
  xp         integer DEFAULT 0,
  mood       text DEFAULT 'chill',
  badges     jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  is_admin   boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_seen  timestamptz DEFAULT now()
);

-- Beats table
CREATE TABLE IF NOT EXISTS beats (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT 'Untitled Beat',
  bpm        integer DEFAULT 120,
  grid       jsonb,
  genre      text,
  is_public  boolean DEFAULT false,
  play_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table (analytics)
CREATE TABLE IF NOT EXISTS events (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  screen     text,
  action     text,
  metadata   jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ── Row Level Security ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, write only their own
CREATE POLICY "Profiles are viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile"  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Beats: public beats readable by all, own beats full access
CREATE POLICY "Public beats are viewable" ON beats FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own beats" ON beats FOR ALL USING (auth.uid() = user_id);

-- Events: users can only insert their own events, admins can read all
CREATE POLICY "Users can insert events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read events"  ON events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ── Make first user admin (run after creating your account) ────────
-- UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';

-- ── Indexes for performance ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_beats_user     ON beats(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user    ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_screen  ON events(screen);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_xp    ON profiles(xp DESC);
