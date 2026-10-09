<!-- Classification: INTERNAL -->
# Sekalian Foto Queue System

Web-based queue system for Sekalian Foto photobox (Blok M Square branch).
Two sides: public customer pages (scan QR → join queue) and a staff/admin dashboard.
Academic capstone project (UPN "Veteran" Jakarta).

## Source of truth
- Requirements: `docs/user-stories.md` (user stories + acceptance criteria). This is the latest version.
- The original proposal is background only. If they conflict, the user stories win.
- UI designs: `docs/design/*.png`.
- Never invent features that are not in the user stories or the designs. Ask instead.

## Tech stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS + shadcn/ui (components live in `components/ui/`, do not edit them)
- PostgreSQL (Supabase) + Prisma ORM
- Zod for validation
- Deployed on Vercel

## Language rules
- Code, identifiers, comments, commit messages: English.
- User-facing UI text: Indonesian, copied exactly from the designs.

## Clean code rules (important)
- Readability over cleverness. A teammate should understand a file in one pass.
- One component per file, one responsibility per component.
- Components are presentational unless stated otherwise: data and actions come in through props.
- Name things by intent: `QueueTable`, `onEndSession`, `isInBooth`. No `data`, `temp`, `handleClick2`.
- Functions stay short. Extract a helper or subcomponent when a block needs a comment to explain it.
- No magic strings or numbers: use typed unions or named constants (e.g. `EXTEND_SESSION_MINUTES = 5`).
- No `any`. Export prop types as `interface <Component>Props`.
- No dead code, no commented-out code, no `console.log`.
- Comments explain *why*, not *what*.
- Prefer composition and early returns over deep nesting.
- Reuse shadcn/ui primitives (`Dialog`, `Button`, `Table`, `Badge`) before writing custom markup.
- Colors and fonts come ONLY from the project's existing design system (global stylesheet / Tailwind theme). Never add new colors or fonts, never hardcode hex values. If a design value has no matching token, use the closest existing token and report it.
- Accessibility: semantic HTML, labeled buttons, keyboard-friendly dialogs.
- Add `"use client"` only where hooks or event handlers require it.

## Folder conventions
- `app/` routes and pages
- `components/admin/` admin-side components
- `components/ui/` shadcn primitives (generated, do not edit)
- `lib/` shared utilities and Zod schemas

## Workflow rules
- Work only on the files named in the current task. Ask before touching anything else.
- Do not install new packages without asking.
- Plan first for anything touching more than one file.
- After changes, run the type check and linter (see `package.json` scripts) and fix what you introduced.
- Keep diffs small and focused. Do not reformat unrelated code.

## Domain notes
- One booth = one separate queue. Queue numbers are per booth (e.g. `A010`).
- The top row of a booth's queue is the customer currently inside the booth.
- End Session removes the top row and promotes the next one (they get the "it's your turn" state).
- Extend Session adds one session (5 minutes) without changing order.
- Average session duration: 5 minutes (used for wait-time estimates).
