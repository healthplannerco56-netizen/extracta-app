# Datalens — AI Data Extraction for Meta-Analysis

Convert research PDFs to structured meta-analysis data using Claude AI.

## Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 14 (App Router) |
| **Hosting** | Vercel (Hobby, \$0) |
| **Database** | Supabase PostgreSQL (Free) |
| **Auth** | Supabase Auth (email + Google) |
| **Storage** | Supabase Storage (2GB) |
| **LLM** | Anthropic Claude |
| **Payments** | (_optional_) LemonSqueezy |

## Quick start

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/00001_schema.sql` via the SQL editor
3. Enable **Auth** (email + Google) and **Storage** (create bucket: `pdfs`)

### 3. Configure env

```bash
cp .env.example .env.local
```

Fill in your Supabase URL and keys (found in Project Settings → API).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

```bash
npm run build
vercel
```

Set the same environment variables in Vercel's dashboard.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | For admin operations |
