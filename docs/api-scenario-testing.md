# API scenario testing

| Script | Purpose |
|--------|---------|
| `npm run test:api` | **Scenario tests** — valid/invalid payloads, response shapes, lifecycle rules |

## Prerequisites

1. **Next.js dev server** running (`npm run dev` → `http://localhost:3000`)
2. **`.env`** with `NEXT_PUBLIC_API_URL` pointing at your backend (e.g. staging)
3. Valid admin credentials (defaults match commented values in `components/auth/login.tsx`)

## Run scenario tests

```bash
npm run dev          # terminal 1
npm run test:api     # terminal 2
```

### Environment overrides

```bash
REGRESSION_EMAIL=admin@example.com \
REGRESSION_PASSWORD=secret \
API_TEST_BASE_URL=http://localhost:3000 \
npm run test:api
```

Skip integration tests (e.g. CI without backend):

```bash
SKIP_API_TESTS=1 npm run test:api
```

## What scenario tests cover

Tests live under `tests/api/scenarios/` and run **serially** against the real staging API.

### Auth
- Valid login → user + cookie
- Invalid email / password → 400
- Unauthenticated proxy → 401
- Logout

### Products
- List pagination, search, `stockStatus` filter
- Create / read / update / delete happy path
- Response body schema (`_id`, `name`, stock fields)
- Missing name, negative price → 400
- Unknown id → 404

### Customers
- List, search, minimal create, full profile
- Invalid email → 400
- Detail includes `balance` object
- Balance adjustments (`customer_owes` / `we_owe_customer`), negative amount rejected
- Nested orders & transactions endpoints

### Orders
- Create with discount, invalid customer, qty 0, discount > 100
- List filters (`status`, `customerId`)
- Confirm pending → `completed`
- Cancel pending → `cancelled`
- Double confirm / cancel completed / double cancel → 400

### Payments & ledger
- Payment with/without `orderId`, all `paymentMethod` values
- Missing customer, zero amount, invalid method → 400
- Ledger list + `customerId` filter, per-customer ledger

### Dashboard
- Metrics shape (totals + alerts)
- Revenue trend for `7d` / `14d` / `30d` / `90d` (series structure)
- Invalid range → 400

## Adding scenarios

1. Add fixtures in `tests/api/fixtures.ts`
2. Add Zod schemas in `tests/api/assertions.ts` if validating new shapes
3. Add `it(...)` blocks in the relevant `tests/api/scenarios/*.scenario.test.ts` file

Use `expectStatus` and `expectBody` helpers instead of checking status alone.
