-- Enable necessary extensions if not already enabled
create extension if not exists "vector"; -- For embeddings if needed later

-- Fix Permissions for public schema if they were restricted
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;
ALTER SCHEMA public OWNER TO postgres;

-- LEARNING PATHS & ROADMAPS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'learning_path_status') THEN
        CREATE TYPE learning_path_status AS ENUM ('not_started', 'in_progress', 'completed', 'archived');
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'milestone_status') THEN
        CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
    END IF;
END $$;

create table if not exists learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  role text not null, -- 'Frontend', 'Backend', 'Fullstack', 'DevOps'
  status learning_path_status default 'not_started',
  generated_from_repo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table learning_paths enable row level security;
drop policy if exists "Users can crud their own learning paths" on learning_paths;
create policy "Users can crud their own learning paths" on learning_paths
  for all using (auth.uid() = user_id);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid references learning_paths(id) on delete cascade not null,
  title text not null,
  description text,
  status milestone_status default 'pending',
  due_date timestamptz,
  order_index integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table milestones enable row level security;
drop policy if exists "Users can crud their own milestones" on milestones;
create policy "Users can crud their own milestones" on milestones
  for all using ( exists ( select 1 from learning_paths where learning_paths.id = milestones.learning_path_id and learning_paths.user_id = auth.uid() ) );

create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid references milestones(id) on delete cascade not null,
  title text not null,
  url text not null,
  type text not null, -- 'video', 'article', 'doc', 'course'
  is_completed boolean default false,
  created_at timestamptz default now()
);

alter table resources enable row level security;
drop policy if exists "Users can crud their own resources" on resources;
create policy "Users can crud their own resources" on resources
  for all using ( exists ( select 1 from milestones join learning_paths on milestones.learning_path_id = learning_paths.id where milestones.id = resources.milestone_id and learning_paths.user_id = auth.uid() ) );

-- USER SKILLS & MATRIX
create table if not exists user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_name text not null,
  proficiency_level integer check (proficiency_level between 1 and 10), -- 1-10 scale
  verified_by_ai boolean default false,
  last_assessed_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(user_id, skill_name)
);

alter table user_skills enable row level security;
drop policy if exists "Users can view and edit their own skills" on user_skills;
create policy "Users can view and edit their own skills" on user_skills
  for all using (auth.uid() = user_id);

-- CODE REVIEWS & INSIGHTS
create table if not exists code_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  repo_name text,
  commit_hash text,
  file_path text,
  code_snippet text,
  ai_feedback text,
  complexity_score integer,
  created_at timestamptz default now()
);

alter table code_reviews enable row level security;
drop policy if exists "Users can view their own code reviews" on code_reviews;
create policy "Users can view their own code reviews" on code_reviews
  for all using (auth.uid() = user_id);

-- INTEGRATIONS (Secure Token Storage)
-- Note: Tokens should be encrypted before ensuring insertion here.
create table if not exists user_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  provider text not null, -- 'github', 'slack', 'jira'
  access_token_encrypted text not null, -- Encrypted content
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);

alter table user_integrations enable row level security;
drop policy if exists "Users can crud their own integrations" on user_integrations;
create policy "Users can crud their own integrations" on user_integrations
  for all using (auth.uid() = user_id);

-- CONVERSATIONS (AI CHAT HISTORY)
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  context_type text, -- 'concept', 'code_review', 'general'
  context_id text, -- ID of the related concept or code review
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table conversations enable row level security;
drop policy if exists "Users can crud their own conversations" on conversations;
create policy "Users can crud their own conversations" on conversations
  for all using (auth.uid() = user_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;
drop policy if exists "Users can crud their own messages" on messages;
create policy "Users can crud their own messages" on messages
  for all using ( exists ( select 1 from conversations where conversations.id = messages.conversation_id and conversations.user_id = auth.uid() ) );

-- TEAMS & COLLABORATION
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table teams enable row level security;
drop policy if exists "Users can crud their own teams" on teams;
create policy "Users can crud their own teams" on teams
  for all using (auth.uid() = created_by);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member', -- 'owner', 'member'
  joined_at timestamptz default now(),
  unique(team_id, user_id)
);

alter table team_members enable row level security;
-- Policy: members can see their team memberships
drop policy if exists "Users can see their own team memberships" on team_members;
create policy "Users can see their own team memberships" on team_members
  for select using (auth.uid() = user_id);

-- ANALYTICS & METRICS
create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade not null,
  name text not null,
  value double precision not null,
  unit text,
  category text default 'performance',
  timestamp timestamptz default now()
);

alter table metrics enable row level security;
drop policy if exists "Team members can view metrics" on metrics;
create policy "Team members can view metrics" on metrics
  for select using ( exists ( select 1 from team_members where team_members.team_id = metrics.team_id and team_members.user_id = auth.uid() ) );

-- PRODUCTIVITY SESSIONS
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  team_id uuid references teams(id) on delete set null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

alter table sessions enable row level security;
drop policy if exists "Users can crud their own sessions" on sessions;
create policy "Users can crud their own sessions" on sessions
  for all using (auth.uid() = user_id);
