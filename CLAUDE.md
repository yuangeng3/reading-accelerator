# Reading Accelerator

## What This Is
A web app for discovering timeless books, prioritizing free/public domain access and indie bookstores over Amazon. Built on Open Library API with a Lindy Score algorithm that ranks books by staying power.

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 (PostCSS plugin, no config file needed)
- Zustand with `persist` middleware for localStorage reading lists
- Open Library Search API (`openlibrary.org/search.json`)
- Deployed on Vercel at `reads.fatfirewoman.com`

## Key Architecture
- `lib/open-library.ts` — Open Library search client (server-side, cached 1hr)
- `lib/lindy-score.ts` — Lindy Score algorithm + book enrichment
- `lib/store.ts` — Zustand store for reading list (persisted to localStorage)
- `lib/types.ts` — All TypeScript types
- `app/api/search/route.ts` — Search API route (proxies to Open Library, adds Lindy Score)
- `components/BookCard.tsx` — Book result card with save/links
- Purchase links go to Bookshop.org (indie bookstores), NOT Amazon

## Ethics Rules
- NEVER summarize books chapter-by-chapter or extract "key learnings" — that's unethical
- AI recommendations should connect books to the USER's goals/questions ("why this book matters for YOU"), not regurgitate content
- Always show free/library options BEFORE purchase links
- Book access hierarchy: Free (public domain) > Library > Buy (indie first)

## Phases
- Phase 1 (current): Search + Discover + Reading List (localStorage)
- Phase 2: AI Reading Paths (Claude API, connect books to user goals)
- Phase 3: Library integration (NYPL holds via Flask on NixiHost)
- Phase 4: SEO pages + growth
