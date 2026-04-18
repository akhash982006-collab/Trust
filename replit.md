# TrustLayer — AI Output Auditor

## Overview

TrustLayer is a real-time AI output auditor that analyzes any text for factual accuracy, bias, manipulation, source diversity, and logical fallacies. It uses Replit's built-in OpenAI AI integration (no external API keys needed).

**Tagline:** "Every AI needs a conscience. We built it."

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not used for this app)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Replit OpenAI AI Integration (via `@workspace/integrations-openai-ai-server`)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Architecture

### Frontend (artifacts/trustlayer)
- React + Vite at path `/`
- Three states: INPUT → LOADING → RESULTS
- Dark cyberpunk aesthetic — electric blue/violet accents on near-black background
- Uses generated React Query hooks from `@workspace/api-client-react`

### Backend (artifacts/api-server)
- Express 5 server at path `/api`
- POST `/api/analyze` — main analysis endpoint
- Runs 5 AI analysis modules in parallel using `Promise.all`
- In-memory cache for 30 minutes per unique input text

### AI Analysis Modules (in `artifacts/api-server/src/lib/trustAnalysis.ts`)
1. **Claim Extractor** — splits text into typed sentences
2. **Fact Checker** — rates factual accuracy of claims
3. **Bias Detector** — detects political, gender, cultural bias
4. **Manipulation Auditor** — detects fear mongering, false urgency, etc.
5. **Fallacy Detector** — detects logical fallacies
6. **Source Diversity Assessor** — rates citation quality

### Trust Score Formula
```
overall = factAccuracy * 0.35 + biasLevel * 0.20 + manipulationRisk * 0.20 + sourceDiversity * 0.15 + logicSoundness * 0.10
```

### Score Labels
- 90-100: "Highly Trustworthy" (green)
- 70-89: "Mostly Reliable" (blue)
- 50-69: "Use Caution" (yellow)
- 30-49: "Significant Concerns" (orange)
- 0-29: "High Risk Content" (red)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/trustlayer run dev` — run frontend locally

## Environment Variables

- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit-managed OpenAI proxy URL
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit-managed API key (dummy string)
- `SESSION_SECRET` — Session secret
- `DATABASE_URL` — PostgreSQL connection (if DB is provisioned)

## Key Files

- `artifacts/api-server/src/lib/trustAnalysis.ts` — All 5 AI analysis modules
- `artifacts/api-server/src/routes/analyze.ts` — POST /api/analyze route
- `artifacts/trustlayer/src/App.tsx` — Main app state management
- `artifacts/trustlayer/src/components/InputPanel.tsx` — Text input UI
- `artifacts/trustlayer/src/components/LoadingState.tsx` — Animated loading screen
- `artifacts/trustlayer/src/components/ResultsPanel.tsx` — Results dashboard
- `lib/api-spec/openapi.yaml` — API contract
