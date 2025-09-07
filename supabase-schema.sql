-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create custom types
create type project_type as enum ('marketing', 'brand');
create type project_status as enum ('draft', 'completed', 'archived');

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text unique not null,
  full_name text,
  avatar_url text
);

-- Create projects table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  type project_type not null,
  status project_status default 'draft' not null,
  data jsonb not null default '{}'::jsonb
);

-- Create marketing campaigns table
create table if not exists public.marketing_campaigns (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  campaign_type text not null,
  target_audience text not null,
  tone text not null,
  prompt text not null,
  generated_content jsonb not null default '[]'::jsonb
);

-- Create brand kits table
create table if not exists public.brand_kits (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  industry text not null,
  style text not null,
  values text not null,
  prompt text not null,
  brand_data jsonb not null default '{}'::jsonb
);

-- Create indexes for better performance
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_type_idx on public.projects(type);
create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists marketing_campaigns_project_id_idx on public.marketing_campaigns(project_id);
create index if not exists brand_kits_project_id_idx on public.brand_kits(project_id);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.marketing_campaigns enable row level security;
alter table public.brand_kits enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create policies for projects
create policy "Users can view their own projects." on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert their own projects." on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own projects." on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete their own projects." on public.projects
  for delete using (auth.uid() = user_id);

-- Create policies for marketing campaigns
create policy "Users can view their own marketing campaigns." on public.marketing_campaigns
  for select using (
    exists (
      select 1 from public.projects 
      where projects.id = marketing_campaigns.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert marketing campaigns for their projects." on public.marketing_campaigns
  for insert with check (
    exists (
      select 1 from public.projects 
      where projects.id = marketing_campaigns.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update marketing campaigns for their projects." on public.marketing_campaigns
  for update using (
    exists (
      select 1 from public.projects 
      where projects.id = marketing_campaigns.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete marketing campaigns for their projects." on public.marketing_campaigns
  for delete using (
    exists (
      select 1 from public.projects 
      where projects.id = marketing_campaigns.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create policies for brand kits
create policy "Users can view their own brand kits." on public.brand_kits
  for select using (
    exists (
      select 1 from public.projects 
      where projects.id = brand_kits.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert brand kits for their projects." on public.brand_kits
  for insert with check (
    exists (
      select 1 from public.projects 
      where projects.id = brand_kits.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can update brand kits for their projects." on public.brand_kits
  for update using (
    exists (
      select 1 from public.projects 
      where projects.id = brand_kits.project_id 
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can delete brand kits for their projects." on public.brand_kits
  for delete using (
    exists (
      select 1 from public.projects 
      where projects.id = brand_kits.project_id 
      and projects.user_id = auth.uid()
    )
  );

-- Create function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Create trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.handle_updated_at();

create trigger marketing_campaigns_updated_at before update on public.marketing_campaigns
  for each row execute procedure public.handle_updated_at();

create trigger brand_kits_updated_at before update on public.brand_kits
  for each row execute procedure public.handle_updated_at();
