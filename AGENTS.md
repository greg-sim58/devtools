# AGENTS.md

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build (also typechecks)
npm run lint     # ESLint via Next.js
```

## Architecture
- **Tools**: Each tool is a React component in `lib/tools/*.tsx` using `"use client"`.
- **Registry**: Tools are registered in `lib/tools.tsx` with `{ slug, name, description, category, icon, component, keywords }`.
- **Routing**: Dynamic route `app/tools/[slug]/page.tsx` renders registered tools.
- **UI**: Shared components in `components/ui.tsx` (Button, Textarea, Select, Input, Label).

## Path Alias
- `@/*` maps to root directory.

## Environment
- `OPENROUTER_API_KEY` required for LINQ↔SQL converter (`app/api/linq-sql/route.ts`).
- Copy `.env.local.example` to `.env.local` and add key.

## Notes
- No tests configured.
- All tools run client-side except LINQ↔SQL (calls OpenRouter API).
