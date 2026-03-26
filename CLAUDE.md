# Business Template — JarvisSDK Onboarding App

## Stack
Next.js 16, TypeScript, Tailwind 4, Supabase

## Commands
```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # Lint
```

## Architecture
- `/onboarding` — 5-step wizard (AI brain, services, team, CEO activity, go live)
- `/dashboard` — Agent status cards, activity feed, quick links
- `/api/agent/chat` — LLM proxy via JarvisSDK
- `/api/agent/heartbeat` — Triggers Paperclip agent heartbeat
- `/api/health` — System health check
- `/api/onboarding/*` — Backend for onboarding wizard steps

## Key Patterns
- All external API calls go through `src/lib/jarvis-sdk.ts` or `src/lib/paperclip.ts`
- Graceful degradation: demo data shown when APIs not configured
- No auth in template — JarvisSDK handles tenant isolation via API key

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- JARVIS_SDK_URL, JARVIS_SDK_API_KEY
- PAPERCLIP_URL, PAPERCLIP_BOARD_KEY
