
-- Enable Vector extension if you plan to use embeddings later (optional)
-- create extension if not exists vector;

-- Repositories Table
create table if not exists repos (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users(id) not null,
  name text not null,
  github_url text unique not null,
  description text,
  status text default 'pending'::text
);

-- Files Table
create table if not exists files (
  id uuid default gen_random_uuid() primary key,
  repo_id uuid references repos(id) on delete cascade not null,
  path text not null,
  language text,
  summary text,
  content text, -- Optional: store file content if reasonable size
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Sessions Table
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  team_id uuid, -- Optional link to team
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  summary text
);

-- Questions Table
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) default auth.uid() not null,
  session_id uuid references sessions(id) on delete set null,
  question text not null,
  answer text,
  context_repo_id uuid references repos(id),
  context_file_id uuid references files(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Session Topics Table
create table if not exists session_topics (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  topic text not null,
  confidence numeric
);

-- RLS Policies example (Basic)
alter table repos enable row level security;
alter table files enable row level security;
alter table sessions enable row level security;
alter table questions enable row level security;
alter table session_topics enable row level security;

create policy "Users can view their own repos" on repos for select using (auth.uid() = owner_id);
create policy "Users can insert their own repos" on repos for insert with check (auth.uid() = owner_id);

create policy "Users can view their own sessions" on sessions for select using (auth.uid() = user_id);
create policy "Users can insert their own sessions" on sessions for insert with check (auth.uid() = user_id);
create policy "Users can update their own sessions" on sessions for update using (auth.uid() = user_id);

create policy "Users can view their own questions" on questions for select using (auth.uid() = user_id);
create policy "Users can insert their own questions" on questions for insert with check (auth.uid() = user_id);
