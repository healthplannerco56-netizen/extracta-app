# Extracta — AI Data Extraction for Meta-Analysis

Convert research PDFs to structured meta-analysis data using Claude AI.

## How it works

1. **Upload PDFs** — drag and drop research papers
2. **Configure fields** — pick what to extract (authors, sample size, effect sizes, etc.)
3. **Extract** — Claude reads each PDF and pulls structured data
4. **Validate & edit** — review cells inline, then export to CSV, JSON, or GradMeta

---

## Project structure

```
extracta-app/
├── app/                          # Next.js App Router
│   ├── api/                      # Server routes (extract, upload, jobs, lemonsqueezy)
│   ├── auth/                     # Login + OAuth callback
│   ├── dashboard/                # Project dashboard
│   ├── extraction/[studyId]/     # PDF + extracted table side-by-side
│   ├── project/[id]/             # Project detail
│   ├── pricing/                  # Free vs. Pro
│   ├── layout.tsx
│   ├── page.tsx                  # Landing + extraction workspace
│   └── globals.css
│
├── components/                   # React components
│   ├── ExtractorApp.tsx          # Main 4-step workspace
│   ├── UploadZone.tsx
│   ├── AuthModal.tsx
│   ├── AuthButton.tsx
│   ├── Navbar.tsx
│   ├── PdfViewer.tsx
│   ├── PdfWorkerSetup.tsx
│   ├── ExtractionTable.tsx
│   ├── ValidationPanel.tsx
│   ├── ConfidenceBadge.tsx
│   └── UpgradeModal.tsx
│
├── hooks/                        # Client hooks
│   ├── useAuth.ts
│   └── useUsage.ts
│
├── lib/                          # Shared libs
│   ├── api.ts                    # Frontend → backend fetch helpers
│   ├── auth.ts
│   ├── supabase.ts               # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client (cookies)
│   ├── types.ts
│   └── constants.ts
│
├── store/                        # Zustand stores
│   └── extractionStore.ts
│
├── types/                        # Shared TS types
│   └── extraction.ts
│
├── backend/                      # Python extraction service
│   ├── main.py                   # FastAPI app
│   ├── requirements.txt
│   │
│   ├── services/
│   │   ├── pdf_parser.py         # pdfplumber text extraction
│   │   ├── chunker.py            # Page → Claude-sized chunks
│   │   ├── claude_client.py      # Anthropic SDK wrapper
│   │   ├── extractor.py          # End-to-end pipeline orchestrator
│   │   ├── validator.py          # Confidence / status normalization
│   │   └── exporter.py           # CSV export
│   │
│   ├── workers/
│   │   └── extraction_worker.py  # Async job runner
│   │
│   ├── schemas/
│   │   └── extraction_schema.py  # Pydantic models
│   │
│   ├── prompts/
│   │   ├── extraction.txt        # Field extraction prompt
│   │   └── validation.txt        # Field validation prompt
│   │
│   └── storage/
│       ├── uploads/              # Original PDFs (gitignored)
│       └── exports/              # Generated CSVs (gitignored)
│
├── docker/                       # Container builds
│   ├── docker-compose.yml
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
│
├── middleware.ts                 # Supabase session refresh
├── next.config.js
├── tsconfig.json
├── package.json
└── .env.local                    # Local secrets (gitignored)
```

---

## Quick start

### 1. Install

```bash
# Frontend
npm install

# Backend
cd backend && pip install -r requirements.txt && cd ..
```

### 2. Configure env

Create `.env.local` in the project root:

```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Backend bridge
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# LemonSqueezy
LEMONSQUEEZY_API_KEY=...
LEMONSQUEEZY_STORE_ID=...
LEMONSQUEEZY_VARIANT_ID=...
LEMONSQUEEZY_WEBHOOK_SECRET=...
NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=https://YOUR-store.lemonsqueezy.com/checkout/buy/...
```

### 3. Run

```bash
# Both services, in separate terminals
npm run dev                       # Next.js on http://localhost:3000
cd backend && uvicorn main:app --reload   # FastAPI on http://localhost:8000
```

Or with Docker:

```bash
docker compose -f docker/docker-compose.yml up --build
```

---

## API

The Next.js app is the public surface; the Python backend is called for the heavy lifting.

| Route                                  | Method | Description                       |
| -------------------------------------- | ------ | --------------------------------- |
| `app/api/extract`                      | POST   | Single-shot Claude extraction     |
| `app/api/upload`                       | POST   | Upload PDF → returns `jobId`      |
| `app/api/jobs/[jobId]`                 | GET    | Poll job status                   |
| `app/api/lemonsqueezy/checkout`        | POST   | Create checkout session           |
| `app/api/lemonsqueezy/webhook`         | POST   | Subscription events → Supabase    |
| `backend /api/upload`                  | POST   | Receives PDF, queues job          |
| `backend /api/extractions/{study_id}`  | GET    | Fetch an extraction               |
| `backend /api/extractions/{id}/export` | GET    | Download CSV                      |

---

## Deployment

- **Frontend** → Vercel (`vercel.json` provided)
- **Backend** → Railway or Fly (`docker/backend.Dockerfile`)
- **Reverse proxy** → `docker/nginx.conf` for self-hosted

---

## Tech stack

- **Next.js 14** — App Router, React Server Components
- **React 18 + TypeScript** — UI
- **pdfjs-dist** — client-side PDF parsing
- **FastAPI + Python 3.12** — extraction service
- **Anthropic Claude** — extraction LLM
- **pdfplumber + pytesseract** — server-side PDF / OCR fallback
- **Supabase** — auth, profiles, usage tracking
- **LemonSqueezy** — payments & subscriptions
