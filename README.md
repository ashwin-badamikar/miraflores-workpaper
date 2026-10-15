# Miraflores Tax Workpaper

A web-native tax workpaper built for the Miraflores AI case study.

## Live Demo
https://miraflores-workpaper.vercel.app

## What it does
- Traces any return line to its exact source document in one click
- 14 screens covering all major workpaper areas
- Real-time shared review notes and audit log via Supabase PostgreSQL
- Role enforcement (Preparer, Reviewer, Partner)
- Surfaces 6 real errors found in the data packet

## Tech Stack
React, Vite, Tailwind CSS, Supabase, Vercel

## Screens
1. Search — full text search across entire workpaper
2. Return Summary — year over year comparison
3. Documents — 74 source documents with extracted values
4. Return Lines — every form line with source tracing
5. Diagnostics — engine warnings and extraction errors
6. Timeline — full engagement history
7. Review and Sign-off — real-time shared notes via Supabase
8. Depreciation — federal vs California vs AMT
9. Carryovers — incoming and outgoing amounts
10. What-If Scenarios — pre-computed alternatives
11. K-1 Detail — partnership and S corporation
12. Client Communications — questionnaire and messages
13. State Split — California vs Texas allocation
14. Books to Tax — Schedule C reconciliation

## Running locally
```bash
npm install
npm run dev
```

Note: Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```