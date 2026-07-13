# Noviq Frontend

Frontend for **Noviq** — AI Employees for Revenue Growth. A Next.js app providing auth (sign in/up, verify, forgot/reset password) and the product dashboard, talking to the [noviq-backend](../noviq-backend) API.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- [React](https://react.dev/) 19, TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4
- [shadcn/ui](https://ui.shadcn.com/) + [HeroUI](https://www.heroui.com/) + [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query) for data fetching
- [next-themes](https://github.com/pacocoursey/next-themes) for theming
- Cloudflare Turnstile for bot protection

## Prerequisites

- **Node.js** 18+
- **pnpm** (recommended)
- A running [noviq-backend](../noviq-backend) instance (for auth and API calls)

## Project setup

```bash
pnpm install
```

## Environment variables

Copy the sample file and set your values:

```bash
cp .env.sample .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_NAME` | No | App name shown in UI/metadata |
| `NEXT_PUBLIC_APP_DESCRIPTION` | No | App description for metadata |
| `NEXT_PUBLIC_CONTACT_URL` | No | Contact link |
| `NEXT_PUBLIC_PRIVACY_URL` | No | Privacy policy link |
| `NEXT_PUBLIC_HOMEPAGE` | No | Marketing homepage URL |
| `NEXT_PUBLIC_APP_THEME` | No | Primary theme color (hex) |
| `NEXT_PUBLIC_HOME_SPLASH_MS` | No | Minimum time (ms) the logo splash shows before session redirect logic runs (default `4000`) |
| `NEXT_PUBLIC_AUTH_URL` | Yes | Backend auth API origin only, no path |
| `NEXT_PUBLIC_AUTH_BASE_PATH` | No | Auth route base path on the backend (default `/v1/auth`) |
| `NEXT_PUBLIC_USER_SESSION_PATH` | No | Session-read path on the backend, relative to `NEXT_PUBLIC_AUTH_URL` (default `/v1/user/session`) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No | Cloudflare Turnstile site key (public, no quotes). Add every origin you use (e.g. `localhost:3000` and `127.0.0.1:3000` are different hosts) under the widget's allowed hostnames. |

## Run the project

```bash
# Development (Turbopack)
pnpm run dev

# Production build and run
pnpm run build
pnpm run start
```

App runs at `http://localhost:3000`.

## Scripts reference

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start dev server with Turbopack |
| `pnpm run build` | Production build |
| `pnpm run start` | Start production server |
| `pnpm run lint` | ESLint |
| `pnpm run format` | Prettier on `**/*.{ts,tsx}` |
| `pnpm run typecheck` | TypeScript, no emit |

## Project structure (high level)

```
app/                     # Next.js App Router routes (thin — renders view/ components)
├── auth/                # signin, signup, verify, forgot, reset
├── dashboard/            # layout.tsx (session-gated sidebar shell), page.tsx, discover/page.tsx
└── layout.tsx, page.tsx, not-found.tsx
view/                    # Page-level view components (the actual UI/logic per route)
├── auth/                 # loginView, signupView, verifyView, forgotView, resetView
└── dashboard/             # dashboardView, discoverView
components/
├── ui/                    # shadcn/ui components
└── theme-provider.tsx
hooks/                   # Shared React hooks (useCurrentUser — session context for dashboard routes)
lib/                      # Shared utilities: api-client.ts (fetch wrapper), auth.ts, companies.ts, showNotification.ts, utils.ts
```

Routes in `app/` stay thin; page logic and layout live in the corresponding `view/` component. `app/dashboard/layout.tsx` checks the session on load and redirects to `/auth/signin` if there isn't one.

### Adding shadcn components

```bash
npx shadcn@latest add button
```

This places the component in `components/ui`. Import it as:

```tsx
import { Button } from "@/components/ui/button";
```

## Related

- Backend API: [noviq-backend](../noviq-backend) — NestJS + PostgreSQL + Claude
