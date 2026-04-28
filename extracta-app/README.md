# Extracta — AI Data Extraction for Meta-Analysis

Convert research PDFs to structured meta-analysis data using Claude AI.

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get an Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create account or log in
3. Go to API Keys → Create Key
4. Copy the key (starts with `sk-ant-`)

### 3. Run Locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
extracta-app/
├── app/
│   ├── api/
│   │   └── extract/
│   │       └── route.ts      # Secure API route for Claude
│   ├── globals.css         # All original styles
│   └── page.tsx           # Main page
├── components/
│   └── ExtractorApp.tsx    # Main app component
├── package.json
├── tsconfig.json
└── README.md
```

---

## How It Works

1. **Upload PDFs** — Drag and drop research papers
2. **Configure Fields** — Select what data to extract (authors, sample size, effect sizes, etc.)
3. **Extract Data** — Claude AI reads each PDF and extracts structured data
4. **Export** — Download as CSV, JSON, or GradMeta format

---

## API Route

The `/api/extract` route securely calls Claude API server-side:

```bash
POST /api/extract
{
  "pdfText": "...",
  "fields": "...",
  "apiKey": "sk-ant-..."
}
```

Returns extracted JSON data.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

---

## Required Environment Variables

None required — API key is entered by user in browser.

---

## Tech Stack

- **Next.js 14** — App Router
- **React 18** — UI
- **TypeScript** — Type safety
- **pdfjs-dist** — Client-side PDF parsing
- **Anthropic API** — Claude AI extraction