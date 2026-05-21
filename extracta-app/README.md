# Extracta

AI-powered clinical data extraction from research PDFs.

## Stack

| Layer     | Tech                                      |
|-----------|-------------------------------------------|
| Frontend  | Next.js 14 (App Router), Tailwind, Zustand |
| Backend   | FastAPI, Python 3.12                      |
| AI        | Claude (`claude-sonnet-4-20250514`)       |
| Queue     | Celery + Redis (in-memory for dev)        |
| Deploy    | Vercel (frontend) + Railway (backend)     |
| Docker    | docker-compose for local full-stack dev   |

## Quick start

### 1. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env   # fill in ANTHROPIC_API_KEY
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker (full stack)
```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up --build
```

## Project structure

```
extracta-app/
├── frontend/          Next.js app
│   ├── app/           Routes + API proxy
│   ├── components/    UI components
│   ├── lib/           API client, auth, constants
│   ├── store/         Zustand state
│   └── types/         TypeScript interfaces
├── backend/           FastAPI service
│   ├── api/routes/    HTTP endpoints
│   ├── services/      PDF parsing, Claude, export
│   ├── workers/       Background job runner
│   ├── prompts/       Claude prompt templates
│   ├── schemas/       Pydantic models
│   └── database/      DB connection + models
├── docker/            Dockerfiles + compose
└── infra/             Vercel, Railway, nginx config
```

## Environment variables

See `.env.example`.
