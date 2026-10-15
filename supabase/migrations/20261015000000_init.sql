-- SocialSync AI Initial Database Migration
-- Enables Row Level Security (RLS) and creates core tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  connected_platforms jsonb default '["Instagram", "LinkedIn", "X"]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  platforms jsonb not null default '[]'::jsonb,
  media_url text,
  hashtags text[] default array[]::text[],
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published', 'failed')),
  stats jsonb default '{"likes": 0, "comments": 0, "shares": 0, "views": 0}'::jsonb,
  is_demo boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

create policy "Users can CRUD own posts" on public.posts
  for all using (auth.uid() = user_id);

-- 3. Drafts Table
create table if not exists public.drafts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  idea text not null,
  content text not null,
  tone text default 'Engaging',
  platforms jsonb default '["Instagram"]'::jsonb,
  hashtags text[] default array[]::text[],
  media_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drafts enable row level security;

create policy "Users can CRUD own drafts" on public.drafts
  for all using (auth.uid() = user_id);

-- 4. Fatigue Analysis Logs Table
create table if not exists public.fatigue_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content_fatigue_score integer not null,
  audience_fatigue_score integer not null,
  audience_trend text default 'Stable',
  overused_hashtags text[] default array[]::text[],
  warning_signals text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fatigue_logs enable row level security;

create policy "Users can view own fatigue logs" on public.fatigue_logs
  for select using (auth.uid() = user_id);
