# Miraflores Tax Workpaper: Design Document

## Core Idea

Traditional tax workpapers are spreadsheets that describe a return. This workpaper is a living audit trail that proves the return. The design principle is simple: every number must be traceable to a human-readable source in one click, and every problem must be visible before it causes a filing error.

The workpaper is built around three questions a CPA asks on every return:

1. Where did this number come from?
2. Is anything wrong?
3. Who has reviewed and approved this?

## Data Model

The packet is a single JSON file with six layers treated as a directed graph:

Source Documents (D01-D74)
↓
Extracted Values (ev-0001 to ev-1100)
↓
Return Lines (F1040.1a, SchC.1, etc.)
↓
Return Summary (federal + california totals)
↓
Diagnostics (engine warnings + extraction flags)
↓
Review Notes (preparer / reviewer / partner sign-offs)


Every line in the return carries a sources array of extracted value IDs. Every extracted value points to a document and page. This chain means any dollar amount can be traced back to the exact printed text on the exact page of the exact document in one click, with confidence score attached.

## Screens Built

1. Search — full text search across all documents, lines, diagnostics, messages and extracted values
2. Return Summary — v3 vs 2024 filed return, year over year changes, v2 to v3 delta
3. Documents — all 74 documents, click to view content and extracted values
4. Return Lines — every form line with source tracing panel, federal and California
5. Diagnostics and Errors — 7 warnings and 4 info items, expandable with referenced lines
6. Timeline — 29 events from engagement signing to IRS examination notice
7. Review and Sign-off — preparer notes, blocking issues, reviewer sign-offs, immutable audit log
8. Depreciation — per asset federal vs California vs AMT with difference highlighting
9. Carryovers — incoming from 2024 and outgoing to 2026, federal and California
10. What-If Scenarios — standard deduction vs itemized, annualized penalty method
11. K-1 Detail — Ridgeline partnership and Lindqvist Family Woodworks S corporation
12. Client Communications — 45 questionnaire items, 10 messages, call notes
13. State Split — California vs Texas income allocation with residency timeline
14. Books to Tax — Erik Lindqvist Schedule C reconciliation with downstream SE tax and QBI

## Five Key Design Decisions

**1. Click to trace, not scroll to find.**
The workpaper opens source panels inline. A CPA stays in context while tracing any number to its exact document, field, and confidence score.

**2. Engine diagnostics are first class citizens.**
The 11 diagnostics surface on their own screen with expandable detail and referenced return line values. They are not buried in a log.

**3. Roles are enforced in the UI.**
The Preparer can add notes. Only the Reviewer and Partner can sign off. Blocking notes display a red banner and prevent filing until resolved. This mirrors real firm workflows.

**4. Version history is explicit.**
The return summary shows v2 to v3 changes line by line, and year over year changes against the 2024 filed return. A new preparer or IRS examiner can see exactly what changed and why.

**5. Simulated documents are structured for real replacement.**
Source document content renders from the printed_content field. The highlight panel, extracted value display, and confidence score are designed so real scanned PDFs could replace the simulated text with zero changes to the tracing logic.

## Tech Stack

React, Vite, Tailwind CSS. The JSON packet loads client side. Review notes and audit log persist in Supabase (PostgreSQL) and are shared across all firm staff in real time. Deployed on Vercel at miraflores-workpaper.vercel.app.

The workpaper is self-contained and loads in under 2 seconds. Supabase handles persistent shared state for review notes and the audit log, with real-time subscriptions pushing updates to all connected clients instantly without a page reload. A production version would add authentication, role-based access control, and PDF rendering for actual scanned documents.

## What I Would Build Next

Given more time, the next additions in priority order:

1. PDF rendering to show actual scanned documents alongside extracted values
2. Authentication and role-based access control so firm staff log in with their own accounts
3. Email notifications when a blocking note is added or a sign-off is requested