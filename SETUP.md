# ListWise - Setup Guide

## Quick Start

### 1. Install dependencies
```bash
cd listwise
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `supabase/schema.sql`
3. Go to Settings > API and copy your URL and anon key
4. Enable Google OAuth in Authentication > Providers (optional)

### 3. Set up Anthropic API
1. Get an API key at [console.anthropic.com](https://console.anthropic.com)

### 4. Set up Stripe
1. Create an account at [stripe.com](https://stripe.com)
2. Create 3 subscription products:
   - **Starter**: $49/mo
   - **Growth**: $149/mo
   - **Pro**: $299/mo
3. Copy the price IDs

### 5. Configure environment variables
```bash
cp .env.local.example .env.local
```
Fill in all values in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - from Supabase dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase dashboard
- `SUPABASE_SERVICE_ROLE_KEY` - from Supabase dashboard
- `ANTHROPIC_API_KEY` - from Anthropic console
- `STRIPE_SECRET_KEY` - from Stripe dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - from Stripe webhook setup
- Add Stripe price IDs: `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_PRO_PRICE_ID`

### 6. Run the dev server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 7. Deploy to Vercel
```bash
npx vercel
```
Set all environment variables in the Vercel dashboard.

## Architecture

```
listwise/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── score/page.tsx              # Free listing score tool (lead gen)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx          # Login
│   │   │   └── signup/page.tsx         # Signup
│   │   ├── auth/callback/route.ts      # OAuth callback
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Dashboard shell
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── generate/page.tsx       # Single listing generator
│   │   │   ├── bulk/page.tsx           # Bulk CSV upload
│   │   │   ├── brand-voice/page.tsx    # Brand voice management
│   │   │   ├── billing/page.tsx        # Subscription management
│   │   │   ├── settings/page.tsx       # Account settings
│   │   │   └── listings/[id]/page.tsx  # Listing detail view
│   │   └── api/
│   │       ├── generate/route.ts       # AI listing generation
│   │       ├── score/route.ts          # Free listing scorer
│   │       └── stripe/
│   │           ├── checkout/route.ts   # Stripe checkout
│   │           └── webhook/route.ts    # Stripe webhooks
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   └── dashboard/shell.tsx         # Dashboard sidebar/layout
│   └── lib/
│       ├── utils.ts                    # Utility functions
│       ├── types.ts                    # TypeScript types
│       ├── ai/
│       │   ├── generate.ts             # Claude API integration
│       │   └── prompts.ts              # Marketplace-specific prompts
│       └── supabase/
│           ├── client.ts               # Browser Supabase client
│           ├── server.ts               # Server Supabase client
│           └── middleware.ts           # Auth middleware
├── supabase/
│   └── schema.sql                      # Database schema
└── SETUP.md                            # This file
```

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API (Haiku for bulk, Sonnet for premium)
- **Payments**: Stripe (subscriptions)
- **Hosting**: Vercel
