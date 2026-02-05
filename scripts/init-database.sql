-- Create users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'analyst', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  category TEXT CHECK (category IN ('performance', 'revenue', 'engagement', 'health')) DEFAULT 'performance',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
  metric_id UUID REFERENCES metrics(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create team_alert_settings table
CREATE TABLE IF NOT EXISTS team_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('above', 'below')) DEFAULT 'above',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_alert_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for teams
CREATE POLICY "Users can view their teams"
  ON teams FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = teams.id
    AND team_members.user_id = auth.uid()
  ));

CREATE POLICY "Only team owners can update teams"
  ON teams FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policies for team_members
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
  ));

CREATE POLICY "Team owners can manage members"
  ON team_members FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_members tm
    WHERE tm.team_id = team_members.team_id
    AND tm.user_id = auth.uid()
    AND tm.role = 'owner'
  ));

-- RLS Policies for metrics
CREATE POLICY "Users can view team metrics"
  ON metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = metrics.team_id
    AND team_members.user_id = auth.uid()
  ));

CREATE POLICY "Team members can insert metrics"
  ON metrics FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = metrics.team_id
    AND team_members.user_id = auth.uid()
  ));

-- RLS Policies for alerts
CREATE POLICY "Users can view team alerts"
  ON alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = alerts.team_id
    AND team_members.user_id = auth.uid()
  ));

-- RLS Policies for team_alert_settings
CREATE POLICY "Users can view alert settings"
  ON team_alert_settings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = team_alert_settings.team_id
    AND team_members.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS metrics_team_id_idx ON metrics(team_id);
CREATE INDEX IF NOT EXISTS metrics_timestamp_idx ON metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS alerts_team_id_idx ON alerts(team_id);
CREATE INDEX IF NOT EXISTS team_members_user_id_idx ON team_members(user_id);
CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER teams_updated_at_trigger
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER alerts_updated_at_trigger
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
