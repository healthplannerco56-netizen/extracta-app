# Asme — Built for the curious

A full-screen hero landing page with looping background video, liquid-glass UI, and a dark cinematic aesthetic.

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS 3** — utility-first styling
- **lucide-react** — icons

## Quick start

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build     # → dist/
npm run preview   # serve dist/ locally
```

## Structure

```
src/
├── HeroSection.tsx   # Full-screen hero component
├── App.tsx           # App root (renders HeroSection)
├── main.tsx          # React entry point
└── index.css         # Tailwind directives + .liquid-glass class
```

## Deploy

Deploy the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages).
