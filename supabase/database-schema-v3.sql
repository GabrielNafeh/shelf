-- Shelf 3.0 Database Schema (additive to schema.sql + database-schema-v2.sql)
-- Run this in your Supabase SQL editor AFTER the v2 schema

-- ============================================================
-- SHELF SCORES
-- ============================================================

create table public.shelf_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  overall_score integer not null check (overall_score >= 0 and overall_score <= 100),
  listing_quality_score integer,
  pricing_score integer,
  review_score integer,
  ad_score integer,
  inventory_score integer,
  category_benchmark integer,
  calculated_at timestamptz not null default now()
);

create table public.shelf_score_history (
  id uuid primary key default uuid_generate_v4(),
  shelf_score_id uuid references public.shelf_scores on delete cascade not null,
  overall_score integer,
  captured_at timestamptz not null default now()
);

-- ============================================================
-- SALES DATA
-- ============================================================

create table public.sales_data (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  connection_id uuid references public.marketplace_connections on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  external_id text,
  order_id text,
  revenue numeric(12,2),
  units integer,
  fees numeric(10,2) default 0,
  ad_spend numeric(10,2) default 0,
  cogs numeric(10,2) default 0,
  profit numeric(12,2),
  currency text default 'USD',
  order_date timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCT METRICS
-- ============================================================

create table public.product_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  listing_id uuid references public.synced_listings on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  bsr integer,
  sessions integer default 0,
  conversion_rate numeric(5,2) default 0,
  units_sold_30d integer default 0,
  revenue_30d numeric(12,2) default 0,
  refund_rate numeric(5,2) default 0,
  captured_at timestamptz not null default now()
);

-- ============================================================
-- ALERTS
-- ============================================================

create table public.alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  type text not null check (type in ('bsr_drop', 'price_change', 'stock_low', 'review_negative', 'score_change')),
  severity text not null check (severity in ('info', 'warning', 'critical')),
  title text not null,
  message text,
  related_entity_id text,
  related_entity_type text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PUBLISH JOBS
-- ============================================================

create table public.publish_jobs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  listing_output_id uuid references public.listing_outputs on delete set null,
  connection_id uuid references public.marketplace_connections on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  status text not null default 'draft' check (status in ('draft', 'queued', 'publishing', 'live', 'error', 'reverted')),
  external_listing_id text,
  published_at timestamptz,
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- AD CAMPAIGNS & METRICS
-- ============================================================

create table public.ad_campaigns (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  connection_id uuid references public.marketplace_connections on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  campaign_name text not null,
  campaign_type text not null check (campaign_type in ('sponsored_products', 'sponsored_brands', 'sponsored_display')),
  status text not null default 'draft' check (status in ('draft', 'suggested', 'active', 'paused', 'ended')),
  daily_budget numeric(10,2),
  bid_strategy text check (bid_strategy in ('dynamic_down', 'dynamic_up_down', 'fixed')),
  target_acos numeric(5,2),
  listing_id uuid references public.synced_listings on delete set null,
  keywords jsonb default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ad_metrics (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.ad_campaigns on delete cascade not null,
  date date not null,
  impressions integer default 0,
  clicks integer default 0,
  spend numeric(10,2) default 0,
  sales numeric(10,2) default 0,
  orders integer default 0,
  acos numeric(5,2),
  roas numeric(5,2),
  tacos numeric(5,2),
  cpc numeric(5,2),
  captured_at timestamptz not null default now()
);

-- ============================================================
-- INVENTORY & INVENTORY ALERTS
-- ============================================================

create table public.inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  connection_id uuid references public.marketplace_connections on delete set null,
  listing_id uuid references public.synced_listings on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  sku text,
  current_stock integer default 0,
  fulfillment_type text check (fulfillment_type in ('fba', 'fbm', 'merchant', 'wfs')),
  daily_velocity numeric(5,2) default 0,
  days_of_supply integer,
  reorder_point integer,
  reorder_qty integer,
  lead_time_days integer default 14,
  unit_cost numeric(10,2),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  inventory_id uuid references public.inventory on delete cascade not null,
  alert_type text not null check (alert_type in ('low_stock', 'out_of_stock', 'overstock', 'reorder_now')),
  message text,
  is_read boolean not null default false,
  predicted_stockout_date date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- REVIEWS & REVIEW RESPONSES
-- ============================================================

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  connection_id uuid references public.marketplace_connections on delete set null,
  listing_id uuid references public.synced_listings on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  external_review_id text,
  reviewer_name text,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  verified_purchase boolean default false,
  review_date timestamptz,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(3,2),
  created_at timestamptz not null default now()
);

create table public.review_responses (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references public.reviews on delete cascade not null,
  response_type text not null check (response_type in ('ai_suggested', 'manual', 'published')),
  response_text text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RESEARCH REPORTS
-- ============================================================

create table public.research_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  query text not null,
  marketplace text not null default 'amazon' check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  demand_score integer,
  competition_level text check (competition_level in ('low', 'medium', 'high', 'very_high')),
  trend text check (trend in ('rising', 'stable', 'declining')),
  avg_price numeric(10,2),
  avg_reviews integer,
  estimated_monthly_revenue numeric(12,2),
  market_gaps jsonb default '[]',
  supplier_margins jsonb default '{}',
  ai_analysis text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRICING RULES & PRICE HISTORY
-- ============================================================

create table public.pricing_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  listing_id uuid references public.synced_listings on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  rule_type text not null check (rule_type in ('buy_box_offset', 'competitor_match', 'margin_floor', 'custom')),
  rule_config jsonb default '{}',
  min_price numeric(10,2),
  max_price numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.price_history (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references public.synced_listings on delete set null,
  old_price numeric(10,2),
  new_price numeric(10,2),
  trigger text not null check (trigger in ('rule', 'manual', 'competitor')),
  rule_id uuid references public.pricing_rules on delete set null,
  changed_at timestamptz not null default now()
);

-- ============================================================
-- A/B TESTS & RESULTS
-- ============================================================

create table public.ab_tests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles on delete cascade not null,
  listing_id uuid references public.synced_listings on delete set null,
  marketplace text not null check (marketplace in ('amazon', 'shopify', 'walmart', 'etsy')),
  test_field text not null check (test_field in ('title', 'bullets', 'description', 'images')),
  variant_a text,
  variant_b text,
  status text not null default 'draft' check (status in ('draft', 'running', 'paused', 'completed')),
  winner text check (winner in ('a', 'b')),
  start_date timestamptz,
  end_date timestamptz,
  significance_threshold numeric(3,2) default 0.95,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ab_test_results (
  id uuid primary key default uuid_generate_v4(),
  test_id uuid references public.ab_tests on delete cascade not null,
  variant text not null check (variant in ('a', 'b')),
  impressions integer default 0,
  clicks integer default 0,
  conversions integer default 0,
  revenue numeric(10,2) default 0,
  conversion_rate numeric(5,2) default 0,
  captured_at timestamptz not null default now()
);

-- ============================================================
-- AGENCY CLIENTS & REPORTS
-- ============================================================

create table public.agency_clients (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid references public.teams on delete cascade not null,
  client_name text not null,
  client_email text,
  logo_url text,
  portal_enabled boolean not null default false,
  portal_slug text unique,
  white_label_config jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agency_reports (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.agency_clients on delete cascade not null,
  report_type text not null check (report_type in ('weekly', 'monthly', 'custom')),
  report_data jsonb default '{}',
  generated_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.shelf_scores enable row level security;
alter table public.shelf_score_history enable row level security;
alter table public.sales_data enable row level security;
alter table public.product_metrics enable row level security;
alter table public.alerts enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.ad_campaigns enable row level security;
alter table public.ad_metrics enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_alerts enable row level security;
alter table public.reviews enable row level security;
alter table public.review_responses enable row level security;
alter table public.research_reports enable row level security;
alter table public.pricing_rules enable row level security;
alter table public.price_history enable row level security;
alter table public.ab_tests enable row level security;
alter table public.ab_test_results enable row level security;
alter table public.agency_clients enable row level security;
alter table public.agency_reports enable row level security;

-- Shelf scores: user can CRUD their own
create policy "Users can view own shelf scores" on public.shelf_scores
  for select using (auth.uid() = user_id);
create policy "Users can create shelf scores" on public.shelf_scores
  for insert with check (auth.uid() = user_id);
create policy "Users can update own shelf scores" on public.shelf_scores
  for update using (auth.uid() = user_id);
create policy "Users can delete own shelf scores" on public.shelf_scores
  for delete using (auth.uid() = user_id);

-- Shelf score history: viewable via shelf_score ownership
create policy "Users can view own shelf score history" on public.shelf_score_history
  for select using (
    exists (
      select 1 from public.shelf_scores
      where shelf_scores.id = shelf_score_history.shelf_score_id
      and shelf_scores.user_id = auth.uid()
    )
  );
create policy "Users can create shelf score history" on public.shelf_score_history
  for insert with check (
    exists (
      select 1 from public.shelf_scores
      where shelf_scores.id = shelf_score_history.shelf_score_id
      and shelf_scores.user_id = auth.uid()
    )
  );

-- Sales data: user can CRUD their own
create policy "Users can view own sales data" on public.sales_data
  for select using (auth.uid() = user_id);
create policy "Users can create sales data" on public.sales_data
  for insert with check (auth.uid() = user_id);
create policy "Users can update own sales data" on public.sales_data
  for update using (auth.uid() = user_id);
create policy "Users can delete own sales data" on public.sales_data
  for delete using (auth.uid() = user_id);

-- Product metrics: user can CRUD their own
create policy "Users can view own product metrics" on public.product_metrics
  for select using (auth.uid() = user_id);
create policy "Users can create product metrics" on public.product_metrics
  for insert with check (auth.uid() = user_id);
create policy "Users can update own product metrics" on public.product_metrics
  for update using (auth.uid() = user_id);
create policy "Users can delete own product metrics" on public.product_metrics
  for delete using (auth.uid() = user_id);

-- Alerts: user can CRUD their own
create policy "Users can view own alerts" on public.alerts
  for select using (auth.uid() = user_id);
create policy "Users can create alerts" on public.alerts
  for insert with check (auth.uid() = user_id);
create policy "Users can update own alerts" on public.alerts
  for update using (auth.uid() = user_id);
create policy "Users can delete own alerts" on public.alerts
  for delete using (auth.uid() = user_id);

-- Publish jobs: user can CRUD their own
create policy "Users can view own publish jobs" on public.publish_jobs
  for select using (auth.uid() = user_id);
create policy "Users can create publish jobs" on public.publish_jobs
  for insert with check (auth.uid() = user_id);
create policy "Users can update own publish jobs" on public.publish_jobs
  for update using (auth.uid() = user_id);
create policy "Users can delete own publish jobs" on public.publish_jobs
  for delete using (auth.uid() = user_id);

-- Ad campaigns: user can CRUD their own
create policy "Users can view own ad campaigns" on public.ad_campaigns
  for select using (auth.uid() = user_id);
create policy "Users can create ad campaigns" on public.ad_campaigns
  for insert with check (auth.uid() = user_id);
create policy "Users can update own ad campaigns" on public.ad_campaigns
  for update using (auth.uid() = user_id);
create policy "Users can delete own ad campaigns" on public.ad_campaigns
  for delete using (auth.uid() = user_id);

-- Ad metrics: viewable via campaign ownership
create policy "Users can view own ad metrics" on public.ad_metrics
  for select using (
    exists (
      select 1 from public.ad_campaigns
      where ad_campaigns.id = ad_metrics.campaign_id
      and ad_campaigns.user_id = auth.uid()
    )
  );
create policy "Users can create ad metrics" on public.ad_metrics
  for insert with check (
    exists (
      select 1 from public.ad_campaigns
      where ad_campaigns.id = ad_metrics.campaign_id
      and ad_campaigns.user_id = auth.uid()
    )
  );

-- Inventory: user can CRUD their own
create policy "Users can view own inventory" on public.inventory
  for select using (auth.uid() = user_id);
create policy "Users can create inventory" on public.inventory
  for insert with check (auth.uid() = user_id);
create policy "Users can update own inventory" on public.inventory
  for update using (auth.uid() = user_id);
create policy "Users can delete own inventory" on public.inventory
  for delete using (auth.uid() = user_id);

-- Inventory alerts: user can CRUD their own
create policy "Users can view own inventory alerts" on public.inventory_alerts
  for select using (auth.uid() = user_id);
create policy "Users can create inventory alerts" on public.inventory_alerts
  for insert with check (auth.uid() = user_id);
create policy "Users can update own inventory alerts" on public.inventory_alerts
  for update using (auth.uid() = user_id);
create policy "Users can delete own inventory alerts" on public.inventory_alerts
  for delete using (auth.uid() = user_id);

-- Reviews: user can CRUD their own
create policy "Users can view own reviews" on public.reviews
  for select using (auth.uid() = user_id);
create policy "Users can create reviews" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "Users can update own reviews" on public.reviews
  for update using (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews
  for delete using (auth.uid() = user_id);

-- Review responses: viewable via review ownership
create policy "Users can view own review responses" on public.review_responses
  for select using (
    exists (
      select 1 from public.reviews
      where reviews.id = review_responses.review_id
      and reviews.user_id = auth.uid()
    )
  );
create policy "Users can create review responses" on public.review_responses
  for insert with check (
    exists (
      select 1 from public.reviews
      where reviews.id = review_responses.review_id
      and reviews.user_id = auth.uid()
    )
  );
create policy "Users can update own review responses" on public.review_responses
  for update using (
    exists (
      select 1 from public.reviews
      where reviews.id = review_responses.review_id
      and reviews.user_id = auth.uid()
    )
  );

-- Research reports: user can CRUD their own
create policy "Users can view own research reports" on public.research_reports
  for select using (auth.uid() = user_id);
create policy "Users can create research reports" on public.research_reports
  for insert with check (auth.uid() = user_id);
create policy "Users can update own research reports" on public.research_reports
  for update using (auth.uid() = user_id);
create policy "Users can delete own research reports" on public.research_reports
  for delete using (auth.uid() = user_id);

-- Pricing rules: user can CRUD their own
create policy "Users can view own pricing rules" on public.pricing_rules
  for select using (auth.uid() = user_id);
create policy "Users can create pricing rules" on public.pricing_rules
  for insert with check (auth.uid() = user_id);
create policy "Users can update own pricing rules" on public.pricing_rules
  for update using (auth.uid() = user_id);
create policy "Users can delete own pricing rules" on public.pricing_rules
  for delete using (auth.uid() = user_id);

-- Price history: viewable via listing ownership (through synced_listings)
create policy "Users can view own price history" on public.price_history
  for select using (
    exists (
      select 1 from public.synced_listings
      where synced_listings.id = price_history.listing_id
      and synced_listings.user_id = auth.uid()
    )
  );
create policy "Users can create price history" on public.price_history
  for insert with check (
    exists (
      select 1 from public.synced_listings
      where synced_listings.id = price_history.listing_id
      and synced_listings.user_id = auth.uid()
    )
  );

-- A/B tests: user can CRUD their own
create policy "Users can view own ab tests" on public.ab_tests
  for select using (auth.uid() = user_id);
create policy "Users can create ab tests" on public.ab_tests
  for insert with check (auth.uid() = user_id);
create policy "Users can update own ab tests" on public.ab_tests
  for update using (auth.uid() = user_id);
create policy "Users can delete own ab tests" on public.ab_tests
  for delete using (auth.uid() = user_id);

-- A/B test results: viewable via test ownership
create policy "Users can view own ab test results" on public.ab_test_results
  for select using (
    exists (
      select 1 from public.ab_tests
      where ab_tests.id = ab_test_results.test_id
      and ab_tests.user_id = auth.uid()
    )
  );
create policy "Users can create ab test results" on public.ab_test_results
  for insert with check (
    exists (
      select 1 from public.ab_tests
      where ab_tests.id = ab_test_results.test_id
      and ab_tests.user_id = auth.uid()
    )
  );

-- Agency clients: viewable by team owner and members
create policy "Team members can view agency clients" on public.agency_clients
  for select using (
    exists (
      select 1 from public.teams
      where teams.id = agency_clients.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members
      where team_members.team_id = agency_clients.team_id
      and team_members.user_id = auth.uid()
    )
  );
create policy "Team admins can create agency clients" on public.agency_clients
  for insert with check (
    exists (
      select 1 from public.teams
      where teams.id = agency_clients.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members
      where team_members.team_id = agency_clients.team_id
      and team_members.user_id = auth.uid()
      and team_members.role = 'admin'
    )
  );
create policy "Team admins can update agency clients" on public.agency_clients
  for update using (
    exists (
      select 1 from public.teams
      where teams.id = agency_clients.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members
      where team_members.team_id = agency_clients.team_id
      and team_members.user_id = auth.uid()
      and team_members.role = 'admin'
    )
  );
create policy "Team admins can delete agency clients" on public.agency_clients
  for delete using (
    exists (
      select 1 from public.teams
      where teams.id = agency_clients.team_id
      and teams.owner_id = auth.uid()
    ) or
    exists (
      select 1 from public.team_members
      where team_members.team_id = agency_clients.team_id
      and team_members.user_id = auth.uid()
      and team_members.role = 'admin'
    )
  );

-- Agency reports: viewable via agency_client team membership
create policy "Team members can view agency reports" on public.agency_reports
  for select using (
    exists (
      select 1 from public.agency_clients
      join public.teams on teams.id = agency_clients.team_id
      where agency_clients.id = agency_reports.client_id
      and (
        teams.owner_id = auth.uid() or
        exists (
          select 1 from public.team_members
          where team_members.team_id = teams.id
          and team_members.user_id = auth.uid()
        )
      )
    )
  );
create policy "Team admins can create agency reports" on public.agency_reports
  for insert with check (
    exists (
      select 1 from public.agency_clients
      join public.teams on teams.id = agency_clients.team_id
      where agency_clients.id = agency_reports.client_id
      and (
        teams.owner_id = auth.uid() or
        exists (
          select 1 from public.team_members
          where team_members.team_id = teams.id
          and team_members.user_id = auth.uid()
          and team_members.role = 'admin'
        )
      )
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================

-- Shelf scores
create index idx_shelf_scores_user on public.shelf_scores(user_id);
create index idx_shelf_scores_calculated on public.shelf_scores(calculated_at desc);
create index idx_shelf_score_history_score on public.shelf_score_history(shelf_score_id);
create index idx_shelf_score_history_captured on public.shelf_score_history(captured_at desc);

-- Sales data
create index idx_sales_data_user on public.sales_data(user_id);
create index idx_sales_data_connection on public.sales_data(connection_id);
create index idx_sales_data_order_date on public.sales_data(order_date desc);
create index idx_sales_data_marketplace on public.sales_data(marketplace);

-- Product metrics
create index idx_product_metrics_user on public.product_metrics(user_id);
create index idx_product_metrics_listing on public.product_metrics(listing_id);
create index idx_product_metrics_captured on public.product_metrics(captured_at desc);

-- Alerts
create index idx_alerts_user on public.alerts(user_id);
create index idx_alerts_created on public.alerts(created_at desc);
create index idx_alerts_unread on public.alerts(user_id, is_read) where is_read = false;

-- Publish jobs
create index idx_publish_jobs_user on public.publish_jobs(user_id);
create index idx_publish_jobs_listing_output on public.publish_jobs(listing_output_id);
create index idx_publish_jobs_connection on public.publish_jobs(connection_id);

-- Ad campaigns
create index idx_ad_campaigns_user on public.ad_campaigns(user_id);
create index idx_ad_campaigns_connection on public.ad_campaigns(connection_id);
create index idx_ad_campaigns_listing on public.ad_campaigns(listing_id);

-- Ad metrics
create index idx_ad_metrics_campaign on public.ad_metrics(campaign_id);
create index idx_ad_metrics_date on public.ad_metrics(date desc);
create index idx_ad_metrics_captured on public.ad_metrics(captured_at desc);

-- Inventory
create index idx_inventory_user on public.inventory(user_id);
create index idx_inventory_connection on public.inventory(connection_id);
create index idx_inventory_listing on public.inventory(listing_id);

-- Inventory alerts
create index idx_inventory_alerts_user on public.inventory_alerts(user_id);
create index idx_inventory_alerts_inventory on public.inventory_alerts(inventory_id);
create index idx_inventory_alerts_unread on public.inventory_alerts(user_id, is_read) where is_read = false;

-- Reviews
create index idx_reviews_user on public.reviews(user_id);
create index idx_reviews_listing on public.reviews(listing_id);
create index idx_reviews_connection on public.reviews(connection_id);
create index idx_reviews_review_date on public.reviews(review_date desc);

-- Review responses
create index idx_review_responses_review on public.review_responses(review_id);

-- Research reports
create index idx_research_reports_user on public.research_reports(user_id);
create index idx_research_reports_created on public.research_reports(created_at desc);

-- Pricing rules
create index idx_pricing_rules_user on public.pricing_rules(user_id);
create index idx_pricing_rules_listing on public.pricing_rules(listing_id);

-- Price history
create index idx_price_history_listing on public.price_history(listing_id);
create index idx_price_history_rule on public.price_history(rule_id);
create index idx_price_history_changed on public.price_history(changed_at desc);

-- A/B tests
create index idx_ab_tests_user on public.ab_tests(user_id);
create index idx_ab_tests_listing on public.ab_tests(listing_id);

-- A/B test results
create index idx_ab_test_results_test on public.ab_test_results(test_id);
create index idx_ab_test_results_captured on public.ab_test_results(captured_at desc);

-- Agency clients
create index idx_agency_clients_team on public.agency_clients(team_id);
create index idx_agency_clients_portal_slug on public.agency_clients(portal_slug) where portal_slug is not null;

-- Agency reports
create index idx_agency_reports_client on public.agency_reports(client_id);
create index idx_agency_reports_generated on public.agency_reports(generated_at desc);
