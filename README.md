# Saiban

Saiban is a Next.js 16 admin dashboard app for managing products, customers, orders, and ledgers.

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + Radix UI components
- TanStack React Query + TanStack Table
- Cookie-based auth and route protection

## Prerequisites

- Node.js 20+ recommended
- npm

## Environment variables

Create a `.env` file in the project root with:

```bash
NEXT_PUBLIC_API_URL=<your-backend-api-base-url>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

These are read from `app/config/index.ts`.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available scripts

- `npm run dev` - run development server
- `npm run build` - build production bundle
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Auth and routing behavior

- `app/page.tsx` redirects:
  - unauthenticated users to `/login`
  - authenticated users to `/admin/dashboard`
- `proxy.ts` protects `/admin/*` and redirects logged-in users away from auth pages.
- Auth token is stored in the `auth-token` cookie.

## Main routes

- Auth: `/login`, `/register`
- Dashboard: `/admin/dashboard`
- Products: `/admin/products`, `/admin/products/v2`
- Customers: `/admin/customers`, `/admin/customers/[id]`, `/admin/customers/v2`, `/admin/customers/v2/[id]`
- Orders: `/admin/orders`, `/admin/orders/[id]`, `/admin/orders/v2`, `/admin/orders/v2/[id]`
- Ledgers: `/admin/ledgers`, `/admin/ledgers/[customerId]/records`, `/admin/ledgers/v2`, `/admin/ledgers/v2/[customerId]`

## API layer

- Client hooks live under `app/api/**` (for example `use-get-all`, `use-create`, `use-update`).
- Backend calls are proxied through `app/api/proxy/[...slug]/route.ts`.
