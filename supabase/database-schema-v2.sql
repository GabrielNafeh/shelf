-- Shelf 2.0 Database Schema (additive to schema.sql)
-- Run this in your Supabase SQL editor AFTER the base schema

-- ============================================================
-- MARKETPLACE CONNECTIONS
-- ============================================================

create table public.marketplace_connections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  store_name text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  seller_id text,
  shop_domain text,
  status text not null default 'pending' check (status in ('pending', 'connected', 'disconnected', 'error')),
  last_sync_at timestamptz,
  sync_status text default 'idle' check (sync_status in ('idle', 'syncing', 'error')),
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique constraint: one connection per marketplace per user
create unique index idx_marketplace_connections_unique
  on public.marketplace_connections(user_id, marketplace);

-- ============================================================
-- SYNCED LISTINGS (from connected marketplaces)
-- ============================================================

create table public.synced_listings (
  id uuid primary key default uuid_generate_v4(),
  connection_id uuid references public.marketplace_connections on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  external_id text not null,
  sku text,
  asin text,
  title text not null default '',
  description text default '',
  bullets text[] default '{}',
  price numeric(10,2),
  currency text default 'USD',
  image_urls text[] default '{}',
  status text default 'active' check (status in ('active', 'inactive', 'suppressed', 'draft')),
  category text,
  backend_keywords text default '',
  seo_score integer,
  raw_data jsonb default '{}',
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_synced_listings_external
  on public.synced_listings(connection_id, external_id);

-- ============================================================
-- BRAND DNA PROFILES
-- ============================================================

create table public.brand_dna_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null default 'My Brand DNA',
  voice_profile jsonb default '{}',
  tone text default '',
  vocabulary text[] default '{}',
  messaging_themes text[] default '{}',
  value_propositions text[] default '{}',
  style_guidelines text default '',
  trained_from jsonb default '{}',
  training_status text not null default 'pending' check (training_status in ('pending', 'training', 'complete', 'error')),
  error_message text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- COMPETITOR MONITORING
-- ============================================================

create table public.competitors (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  marketplace text not null default 'amazon' check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  external_id text,
  asin text,
  url text,
  title text not null default '',
  brand text,
  current_price numeric(10,2),
  current_bsr integer,
  current_rating numeric(3,2),
  current_review_count integer default 0,
  image_url text,
  category text,
  status text not null default 'active' check (status in ('active', 'paused', 'removed')),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competitor_snapshots (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references public.competitors on delete cascade not null,
  price numeric(10,2),
  bsr integer,
  rating numeric(3,2),
  review_count integer default 0,
  in_stock boolean default true,
  buy_box_owner text,
  captured_at timestamptz not null default now()
);

-- ============================================================
-- KEYWORD RANK TRACKING
-- ============================================================

create table public.keyword_ranks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  marketplace text not null default 'amazon' check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  keyword text not null,
  asin text,
  listing_id uuid references public.synced_listings on delete set null,
  current_rank integer,
  previous_rank integer,
  best_rank integer,
  search_volume integer,
  trend text default 'stable' check (trend in ('up', 'down', 'stable', 'new')),
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.keyword_rank_history (
  id uuid primary key default uuid_generate_v4(),
  keyword_rank_id uuid references public.keyword_ranks on delete cascade not null,
  rank integer,
  page integer,
  captured_at timestamptz not null default now()
);

-- ============================================================
-- TEAMS & AGENCY MODE
-- ============================================================

create table public.teams (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references public.profiles on delete cascade not null,
  slug text unique,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  joined_at timestamptz not null default now()
);

create unique index idx_team_members_unique
  on public.team_members(team_id, user_id);

create table public.team_invitations (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams on delete cascade not null,
  email text not null,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  invited_by uuid references public.profiles on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.marketplace_connections enable row level security;
alter table public.synced_listings enable row level security;
alter table public.brand_dna_profiles enable row level security;
alter table public.competitors enable row level security;
alter table public.competitor_snapshots enable row level security;
alter table public.keyword_ranks enable row level security;
alter table public.keyword_rank_history enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_invitations enable row level security;

-- Marketplace connections: user can CRUD their own
create policy "Users can view own connections" on public.marketplace_connections
  for select using (auth.uid() = user_id);
create policy "Users can create connections" on public.marketplace_connections
  for insert with check (auth.uid() = user_id);
create policy "Users can update own connections" on public.marketplace_connections
  for update using (auth.uid() = user_id);
create policy "Users can delete own connections" on public.marketplace_connections
  for delete using (auth.uid() = user_id);

-- Synced listings: user can CRUD their own
create policy "Users can view own synced listings" on public.synced_listings
  for select using (auth.uid() = user_id);
create policy "Users can create synced listings" on public.synced_listings
  for insert with check (auth.uid() = user_id);
create policy "Users can update own synced listings" on public.synced_listings
  for update using (auth.uid() = user_id);
create policy "Users can delete own synced listings" on public.synced_listings
  for delete using (auth.uid() = user_id);

-- Brand DNA: user can CRUD their own
create policy "Users can view own brand dna" on public.brand_dna_profiles
  for select using (auth.uid() = user_id);
create policy "Users can create brand dna" on public.brand_dna_profiles
  for insert with check (auth.uid() = user_id);
create policy "Users can update own brand dna" on public.brand_dna_profiles
  for update using (auth.uid() = user_id);
create policy "Users can delete own brand dna" on public.brand_dna_profiles
  for delete using (auth.uid() = user_id);

-- Competitors: user can CRUD their own
create policy "Users can view own competitors" on public.competitors
  for select using (auth.uid() = user_id);
create policy "Users can create competitors" on public.competitors
  for insert with check (auth.uid() = user_id);
create policy "Users can update own competitors" on public.competitors
  for update using (auth.uid() = user_id);
create policy "Users can delete own competitors" on public.competitors
  for delete using (auth.uid() = user_id);

-- Competitor snapshots: viewable via competitor ownership
create policy "Users can view own competitor snapshots" on public.competitor_snapshots
  for select using (
    exists (
      select 1 from public.competitors
      where competitors.id = competitor_snapshots.competitor_id
      and competitors.user_id = auth.uid()
    )
  );
create policy "Users can create competitor snapshots" on public.competitor_snapshots
  for insert with check (
    exists (
      select 1 from public.competitors
      where competitors.id = competitor_snapshots.competitor_id
      and competitors.user_id = auth.uid()
    )
  );

-- Keyword ranks: user can CRUD their own
create policy "Users can view own keyword ranks" on public.keyword_ranks
  for select using (auth.uid() = user_id);
create policy "Users can create keyword ranks" on public.keyword_ranks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own keyword ranks" on public.keyword_ranks
  for update using (auth.uid() = user_id);
create policy "Users can delete own keyword ranks" on public.keyword_ranks
  for delete using (auth.uid() = user_id);

-- Keyword rank history: viewable via keyword_rank ownership
create policy "Users can view own keyword history" on public.keyword_rank_history
  for select using (
    exists (
      select 1 from public.keyword_ranks
      where keyword_ranks.id = keyword_rank_history.keyword_rank_id
      and keyword_ranks.user_id = auth.uid()
    )
  );
create policy "Users can create keyword history" on public.keyword_rank_history
  for insert with check (
    exists (
      select 1 from public.keyword_ranks
      where keyword_ranks.id = keyword_rank_history.keyword_rank_id
      and keyword_ranks.user_id = auth.uid()
    )
  );

-- Teams: owner and members can view
create policy "Team members can view team" on public.teams
  for select using (
    auth.uid() = owner_id or
    exists (
      select 1 from public.team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );
create policy "Users can create teams" on public.teams
  for insert with check (auth.uid() = owner_id);
create policy "Team owner can update" on public.teams
  for update using (auth.uid() = owner_id);
create policy "Team owner can delete" on public.teams
  for delete using (auth.uid() = owner_id);

-- Team members: viewable by team members
create policy "Team members can view members" on public.team_members
  for select using (
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    ) or
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    )
  );
create policy "Team admins can manage members" on public.team_members
  for insert with check (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
    )
  );
create policy "Team admins can remove members" on public.team_members
  for delete using (
    exists (
      select 1 from public.teams
      where teams.id = team_members.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members as tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
      and tm.role = 'admin'
    ) or
    auth.uid() = user_id
  );

-- Team invitations: viewable by invitee or team admins
create policy "Users can view invitations" on public.team_invitations
  for select using (
    email = (select email from auth.users where id = auth.uid()) or
    exists (
      select 1 from public.teams
      where teams.id = team_invitations.team_id
      and teams.owner_id = auth.uid()
    )
  );
create policy "Team admins can create invitations" on public.team_invitations
  for insert with check (
    exists (
      select 1 from public.teams
      where teams.id = team_invitations.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members
      where team_members.team_id = team_invitations.team_id
      and team_members.user_id = auth.uid()
      and team_members.role = 'admin'
    )
  );
create policy "Invitees can update invitation" on public.team_invitations
  for update using (
    email = (select email from auth.users where id = auth.uid())
  );

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_marketplace_connections_user on public.marketplace_connections(user_id);
create index idx_synced_listings_user on public.synced_listings(user_id);
create index idx_synced_listings_connection on public.synced_listings(connection_id);
create index idx_synced_listings_marketplace on public.synced_listings(marketplace);
create index idx_brand_dna_user on public.brand_dna_profiles(user_id);
create index idx_competitors_user on public.competitors(user_id);
create index idx_competitor_snapshots_competitor on public.competitor_snapshots(competitor_id);
create index idx_competitor_snapshots_captured on public.competitor_snapshots(captured_at desc);
create index idx_keyword_ranks_user on public.keyword_ranks(user_id);
create index idx_keyword_rank_history_rank on public.keyword_rank_history(keyword_rank_id);
create index idx_team_members_team on public.team_members(team_id);
create index idx_team_members_user on public.team_members(user_id);
create index idx_team_invitations_email on public.team_invitations(email);
create index idx_team_invitations_team on public.team_invitations(team_id);
