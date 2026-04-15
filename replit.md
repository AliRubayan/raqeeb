# Raqeeb (رقيب) — Saudi FinTech Contract Audit Platform

## Overview

Raqeeb is a high-security B2B FinTech audit platform targeting Saudi Arabian compliance (SAMA, PDPL, NCA).
Users pay via StreamPay before uploading a contract. Three AI agents (Inspector, Law Finder, Drafter)
analyze the contract via an n8n webhook. Results are surfaced in a Stream Chat "Decision Room."

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Payment gateway**: StreamPay (`https://stream-app-service.streampay.sa`)
- **AI orchestration**: n8n webhook (3 agents: Inspector, Law Finder, Drafter)

## Architecture — The Gatekeeper Flow

```
User → Create Contract → StreamPay Payment Link → User Pays
     → POST /api/audits/start (verifies payment) → n8n Webhook
     → 3 AI Agents process → POST /api/audits/webhook/n8n
     → Results saved → Stream Chat Decision Room created
     → User: Approve / Reject / Review
```

## Database Schema (PostgreSQL)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | auto-generated |
| email | text UNIQUE | |
| password_hash | text | bcrypt |
| has_active_subscription | boolean | linked to StreamPay payment status |
| streampay_consumer_id | text nullable | StreamPay consumer ID |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `contracts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | **same ID sent to n8n and Stream Chat** |
| user_id | uuid FK → users | |
| contract_name | text | |
| status | enum | Paid / Analyzing / Completed / Rejected |
| contract_text | text | full contract content |
| stream_channel_id | text nullable | Stream Chat Decision Room |
| streampay_payment_link_id | text nullable | |
| streampay_payment_link_url | text nullable | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `audit_results`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| contract_id | uuid FK → contracts | |
| risk_score | integer | 0–100 |
| severity | enum | Low / Medium / High |
| inspector_output | text | المفتش results |
| law_finder_output | text | المشرع results |
| drafter_output | text | المحامي results |
| n8n_raw_response | text nullable | full n8n JSON saved for audit trail |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Repository Functions

### `artifacts/api-server/src/repositories/users.ts`
- `findUserByEmail(email)` → User | undefined
- `findUserById(id)` → User | undefined
- `createUser(data)` → User
- `hasValidPayment(userId)` → boolean ← **used by the gatekeeper**
- `setActiveSubscription(userId, active)` → void

### `artifacts/api-server/src/repositories/contracts.ts`
- `createContract(data)` → Contract
- `findContractById(id)` → Contract | undefined
- `getContractsByUser(userId)` → Contract[] ← **powers the dashboard**
- `updateContractStatus(contractId, status)` → void
- `updateContractStreamChannel(contractId, channelId)` → void
- `updateContractPaymentLink(contractId, linkId, linkUrl)` → void

### `artifacts/api-server/src/repositories/audit-results.ts`
- `saveAuditResult(contractId, n8nPayload)` → AuditResult ← **saves n8n JSON directly**
- `getAuditResultByContract(contractId)` → AuditResult | undefined
- `getAllAuditResults()` → AuditResult[]

## StreamPay Integration (`artifacts/api-server/src/lib/streampay.ts`)
- `createPaymentLink(params)` → creates a one-time SAR payment link
- `getPaymentLink(id)` → fetches status
- `isPaymentCompleted(id)` → boolean (status === "COMPLETED")

**Required secret**: `STREAMPAY_API_KEY` (set via Replit Secrets)
**Base URL env var**: `STREAMPAY_BASE_URL` = `https://stream-app-service.streampay.sa`

## API Endpoints (OpenAPI)

| Method | Path | Purpose |
|---|---|---|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| POST | /api/auth/logout | Logout |
| POST | /api/payments/create-link | Create StreamPay link for contract |
| GET | /api/payments/verify/:contractId | Check if payment completed |
| POST | /api/contracts | Create contract shell |
| GET | /api/contracts/history | Dashboard — user's audit history |
| GET | /api/contracts/:id | Single contract detail |
| POST | /api/audits/start | **Gatekeeper** — verifies payment, fires n8n |
| POST | /api/audits/webhook/n8n | n8n posts AI results here |
| GET | /api/audits/:contractId | Get full audit result |
| POST | /api/audits/:contractId/action | Approve / Reject / Review |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Environment Variables / Secrets Required

| Key | Type | Description |
|---|---|---|
| `STREAMPAY_API_KEY` | Secret | StreamPay API key for payment operations |
| `STREAMPAY_BASE_URL` | Env var | `https://stream-app-service.streampay.sa` ✅ set |
| `SESSION_SECRET` | Secret | Express session signing ✅ set |
| `DATABASE_URL` | Secret | PostgreSQL connection string ✅ set |
| `N8N_WEBHOOK_URL` | Secret | n8n webhook endpoint (to be set) |
| `STREAM_API_KEY` | Secret | Stream.io API key (to be set) |
| `STREAM_API_SECRET` | Secret | Stream.io secret (to be set) |

## Frontend (React Vite — `artifacts/raqeeb-web`)

- **Artifact slug**: `raqeeb-web`, port 18970, previewPath `/`
- **Language**: Arabic RTL — `dir="rtl"` and `lang="ar"` set on `<html>` via `useEffect` in `App.tsx`
- **Font**: Cairo (Google Fonts, loaded dynamically)
- **Routing**: wouter with `<WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>`
- **Auth**: `ProtectedLayout` wraps each protected route, calls `useGetMe()`, redirects to `/login` on 401
- **API hooks**: Orval-generated hooks from `@workspace/api-client-react`
- **PDF Upload**: native `fetch` with `FormData` to `POST /api/contracts/upload` (no generated hook, multipart)

### Pages
| Route | Component | Purpose |
|---|---|---|
| `/login` | `Login.tsx` | Sign in |
| `/register` | `Register.tsx` | Create account |
| `/` | `Dashboard.tsx` | Contract history (protected) |
| `/dashboard` | `Dashboard.tsx` | Contract history (protected) |
| `/upload` | `Upload.tsx` | PDF upload for AI analysis (protected) |
| `/contracts/:id` | `DecisionRoom.tsx` | AI audit results + Approve/Consult actions (protected) |

### Decision Room Behavior
- Polls `useGetContract` + `useGetAuditResult` every 5s while status is "Analyzing"
- Shows Inspector, Law Finder, Drafter outputs in tabbed layout with risk meter
- "Approved" → calls `useAuditAction({ action: "Approve" })` → full-screen Arabic success overlay
- "استشارة" → opens a dialog (placeholder for Stream Chat integration)

## Design Language

- **Colors**: Teal/green primary, deep navy background, high-contrast text
- **Typography**: Cairo (Arabic), professional legal-tech aesthetic
- **Tone**: Authoritative, Professional, Secure
- **Direction**: RTL (Arabic-first)
