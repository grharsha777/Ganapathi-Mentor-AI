
-- Teams Table
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Team Members
create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text check (role in ('owner', 'member', 'viewer')) default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

-- Metrics Table
create table if not exists metrics (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  value numeric not null,
  unit text,
  category text default 'performance',
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Alerts Table
create table if not exists alerts (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete cascade not null,
  title text not null,
  description text,
  severity text check (severity in ('info', 'warning', 'critical')) default 'info',
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table teams enable row level security;
alter table team_members enable row level security;
alter table metrics enable row level security;
alter table alerts enable row level security;

-- Teams: Users can view teams they are members of
create policy "Users can view teams they belong to" on teams
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Users can create teams" on teams
  for insert with check (auth.uid() = created_by);

-- Team Members
create policy "Users can view members of their teams" on team_members
  for select using (
    exists (
      select 1 from team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
  );
  
-- Allow users to add themselves (e.g. creating a team adds owner)
create policy "Users can add members (owners only)" on team_members
  for insert with check (
    -- Either the user is adding themselves (for team creation)
    auth.uid() = user_id
    OR
    -- Or the user is an owner of the team
    exists (
      select 1 from team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'owner'
    )
  );

-- Basic Metrics/Alerts access
create policy "Team members can view metrics" on metrics
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = metrics.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Team members can view alerts" on alerts
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = alerts.team_id
      and team_members.user_id = auth.uid()
    )
  );
