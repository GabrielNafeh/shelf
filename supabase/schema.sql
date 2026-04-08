-- ListWise Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'growth', 'pro')),
  listings_used_this_month integer not null default 0,
  listings_limit integer not null default 10,
  stripe_customer_id text,
  stripe_subscription_id text,
  usage_reset_date timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Brand voices
create table public.brand_voices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  tone text not null default 'professional',
  vocabulary text[] default '{}',
  example_listings text[] default '{}',
  guidelines text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Generated listings
create table public.listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  brand_voice_id uuid references public.brand_voices on delete set null,
  product_name text not null,
  product_input jsonb not null default '{}',
  status text not null default 'generating' check (status in ('generating', 'complete', 'error')),
  created_at timestamptz not null default now()
);

-- Listing outputs (one per marketplace)
create table public.listing_outputs (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.listings on delete cascade not null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  title text not null default '',
  bullets text[] default '{}',
  description text not null default '',
  backend_keywords text default '',
  meta_title text default '',
  meta_description text default '',
  tags text[] default '{}',
  schema_markup text default '',
  seo_score integer default 0,
  created_at timestamptz not null default now()
);

-- Bulk jobs
create table public.bulk_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  filename text not null,
  total_products integer not null default 0,
  processed_products integer not null default 0,
  status text not null default 'pending' check (status in ('pending', 'processing', 'complete', 'error')),
  marketplaces text[] not null default '{amazon}',
  brand_voice_id uuid references public.brand_voices on delete set null,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Listing score checks (lead gen, no auth required)
create table public.score_checks (
  id uuid primary key default uuid_generate_v4(),
  email text,
  url text,
  listing_text text,
  marketplace text default 'amazon',
  score_result jsonb,
  created_at timestamptz not null default now()
);

-- Row level security
alter table public.profiles enable row level security;
alter table public.brand_voices enable row level security;
alter table public.listings enable row level security;
alter table public.listing_outputs enable row level security;
alter table public.bulk_jobs enable row level security;
alter table public.score_checks enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Brand voices: users can CRUD their own
create policy "Users can view own brand voices" on public.brand_voices
  for select using (auth.uid() = user_id);
create policy "Users can create brand voices" on public.brand_voices
  for insert with check (auth.uid() = user_id);
create policy "Users can update own brand voices" on public.brand_voices
  for update using (auth.uid() = user_id);
create policy "Users can delete own brand voices" on public.brand_voices
  for delete using (auth.uid() = user_id);

-- Listings: users can CRUD their own
create policy "Users can view own listings" on public.listings
  for select using (auth.uid() = user_id);
create policy "Users can create listings" on public.listings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on public.listings
  for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on public.listings
  for delete using (auth.uid() = user_id);

-- Listing outputs: users can view outputs of their own listings
create policy "Users can view own listing outputs" on public.listing_outputs
  for select using (
    exists (
      select 1 from public.listings
      where listings.id = listing_outputs.listing_id
      and listings.user_id = auth.uid()
    )
  );
create policy "Users can create listing outputs" on public.listing_outputs
  for insert with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_outputs.listing_id
      and listings.user_id = auth.uid()
    )
  );

-- Bulk jobs: users can CRUD their own
create policy "Users can view own bulk jobs" on public.bulk_jobs
  for select using (auth.uid() = user_id);
create policy "Users can create bulk jobs" on public.bulk_jobs
  for insert with check (auth.uid() = user_id);
create policy "Users can update own bulk jobs" on public.bulk_jobs
  for update using (auth.uid() = user_id);

-- Score checks: anyone can insert (public lead gen tool)
create policy "Anyone can create score checks" on public.score_checks
  for insert with check (true);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to reset monthly usage (run via cron)
create or replace function public.reset_monthly_usage()
returns void as $$
begin
  update public.profiles
  set listings_used_this_month = 0,
      usage_reset_date = date_trunc('month', now()) + interval '1 month'
  where usage_reset_date <= now();
end;
$$ language plpgsql security definer;

-- Indexes
create index idx_listings_user_id on public.listings(user_id);
create index idx_listings_created_at on public.listings(created_at desc);
create index idx_listing_outputs_listing_id on public.listing_outputs(listing_id);
create index idx_brand_voices_user_id on public.brand_voices(user_id);
create index idx_bulk_jobs_user_id on public.bulk_jobs(user_id);
