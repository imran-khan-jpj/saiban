# Backend Handoff — Purchase Price & Profit Tracking

This document specifies the backend changes required to support the **purchase
price (cost) vs. sale price** and **profit/margin statistics** feature that has
already been implemented on the Saiban frontend.

The frontend is **already wired** to consume every field below. Until the
backend returns these fields, the UI gracefully degrades (shows `—` / "no data
yet"), so this can ship incrementally.

## Conventions

- **Currency values** may be returned as a `number` or a decimal `string`; the
  frontend parses both. Prefer 2-decimal precision.
- **All profit/cost data is internal.** It must NOT appear on customer-facing
  invoices. The PDF invoice was intentionally left untouched on the frontend.
- **Profit excludes GST.** Profit is computed against `subtotal` (net of
  line discounts, before GST), not `grandTotal`.
- **Margin** = `(revenue − cost) / revenue × 100`, expressed as a percentage
  `0–100` (can be negative if selling below cost). Return `0` when revenue is `0`.
- Cancelled orders are **excluded** from all revenue/cost/profit aggregates.

## Core definitions

| Term | Meaning |
|------|---------|
| Purchase price / cost price | What Saiban pays the supplier, per unit |
| Sale price (`unitPrice`) | What the customer pays, per unit (already exists) |
| COGS | Cost of Goods Sold = cost of items actually sold |
| Gross profit | Revenue (net of discount, ex-GST) − COGS |
| Margin % | Gross profit ÷ revenue × 100 |

---

## 1. Product — add `purchasePrice`

Add a `purchasePrice` field (per-unit cost) to the Product schema.

### Schema
- `purchasePrice: number` — required, `>= 0`. Reuse the same validation rules as
  `unitPrice` (non-negative, max 2 decimal places).

### `POST /api/products` (create)
Request body now includes `purchasePrice`:

```json
{
  "name": "Saiban Syrup 120ml",
  "shortDescription": "Pain relief syrup",
  "descriptionUrdu": "...",
  "formulation": "syrup",
  "packType": "ml",
  "size": 120,
  "unitPrice": 250,
  "purchasePrice": 180,
  "lowStockThreshold": 20,
  "quantityInStock": 100
}
```

### `PATCH /api/products/:id` (update)
Same as above — accept `purchasePrice` in the update body.

### Product reads (`GET /api/products`, `GET /api/products/:id`)
Return `purchasePrice` on every product object:

```json
{
  "_id": "665f...",
  "name": "Saiban Syrup 120ml",
  "unitPrice": 250,
  "purchasePrice": 180,
  "quantityInStock": 100,
  "lowStockThreshold": 20,
  "...": "other existing fields unchanged"
}
```

> Note: `purchasePrice` is typed as optional on the frontend read model for
> backward compatibility, but please return it for all products once migrated.

---

## 2. Orders — snapshot cost & compute profit

When an order is created, **snapshot the product's current `purchasePrice` onto
each line item** as `costPrice`. This locks historical profit so it stays
correct even if the product's cost changes later.

The create request is **unchanged** — the client still sends only
`productId`, `quantity`, `discountPercentage`. The backend derives cost from the
product, exactly as it already derives `unitPrice`.

### Order line item — add fields
Per item, add:
- `costPrice: number` — unit cost snapshotted at order time (= product
  `purchasePrice` at that moment).
- `lineCost: number` — `costPrice × quantity` (convenience; optional but
  preferred).

Also include `purchasePrice` on the populated `productId` snapshot (optional).

### Order — add fields
At the order level, add:
- `costTotal: number` — `Σ (costPrice × quantity)` across items (COGS for the order).
- `profitTotal: number` — `subtotal − costTotal` (ex-GST gross profit).

### Order reads (`GET /api/orders`, `GET /api/orders/:id`, `GET /api/customers/:id/orders`)
Example item + totals:

```json
{
  "items": [
    {
      "productId": { "_id": "665f...", "name": "Saiban Syrup 120ml", "purchasePrice": 180, "...": "..." },
      "quantity": 10,
      "unitPrice": 250,
      "costPrice": 180,
      "discountPercentage": 5,
      "lineTotal": 2375,
      "lineCost": 1800
    }
  ],
  "subtotal": 2375,
  "discountTotal": 125,
  "gstTotal": 0,
  "costTotal": 1800,
  "profitTotal": 575,
  "grandTotal": 2375
}
```

(`profitTotal = subtotal(2375) − costTotal(1800) = 575`; margin = 575/2375 ≈ 24.2%.)

---

## 3. `GET /api/dashboard/metrics` — add profitability fields

Add the following to the existing `metrics` object (all currency, except
`profitMargin`):

```json
{
  "metrics": {
    "totalProducts": 120,
    "totalCustomers": 80,
    "totalOrders": 540,
    "totalRevenue": 1250000,
    "pendingPayments": 90000,
    "receivedPayments": 1160000,

    "totalCost": 870000,
    "grossProfit": 380000,
    "profitMargin": 30.4,
    "inventoryValueAtCost": 540000
  },
  "alerts": { "lowStockProducts": [], "pendingOrders": [] }
}
```

| Field | Definition |
|-------|-----------|
| `totalCost` | COGS across all non-cancelled orders (`Σ order.costTotal`) |
| `grossProfit` | `totalRevenue − totalCost` |
| `profitMargin` | `grossProfit / totalRevenue × 100` (0–100; 0 if revenue 0) |
| `inventoryValueAtCost` | Current stock valued at cost: `Σ (product.quantityInStock × product.purchasePrice)` over all products |

All four are optional from the frontend's perspective (it falls back to `—` or
client-derives `grossProfit`/`profitMargin` when only `totalCost` is present),
but please return all four.

---

## 4. `GET /api/dashboard/revenue-trend?range=7d|14d|30d|90d` — add cost & profit

Add per-bucket `cost` and `profit`, plus summary totals. Existing fields
unchanged.

```json
{
  "range": "14d",
  "granularity": "day",
  "summary": {
    "totalRevenue": 250000,
    "totalCost": 170000,
    "totalProfit": 80000,
    "orderCount": 120,
    "excludedStatuses": ["cancelled"]
  },
  "series": [
    {
      "bucketStart": "2026-06-14T00:00:00.000Z",
      "label": "Jun 14",
      "revenue": 18000,
      "cost": 12200,
      "profit": 5800,
      "orderCount": 9
    }
  ]
}
```

- `cost` per bucket = COGS of orders in that bucket.
- `profit` per bucket = `revenue − cost`.
- Same bucketing/timezone/exclusion rules as the existing revenue series.

### Aggregation guardrails (important)

Orders created **before** cost tracking shipped have no snapshotted `costPrice`.
Until those orders are backfilled (see §7), the API must **not** imply profit on
them:

1. **`revenue`** — always include every non-cancelled order in the bucket (unchanged).
2. **`cost`** — sum only orders/items with a recorded `costPrice`. Omit the field
   or return `0` when no snapshotted cost exists in the bucket; do **not** treat
   missing cost as `0` profit.
3. **`profit`** — return only when the bucket has **snapshotted** cost data
   (`cost > 0` from orders that actually have `costPrice`). Do **not** set
   `profit = revenue` when cost is missing or zero — that shows a misleading
   100% margin on the chart. Prefer `null`/omit `profit` for those buckets.

The frontend applies the same rule: profit overlays are hidden when cost is
missing or zero.

---

## 5. New endpoint — `GET /api/dashboard/top-products`

Returns the most profitable products, used by the "Most profitable products"
card.

### Query params
| Param | Values | Default |
|-------|--------|---------|
| `metric` | `profit` \| `margin` \| `revenue` | `profit` |
| `limit` | integer | `5` |

`metric` controls the sort order (descending). Aggregate over non-cancelled
orders.

### Response

```json
{
  "metric": "profit",
  "data": [
    {
      "productId": "665f...",
      "name": "Saiban Syrup 120ml",
      "unitsSold": 320,
      "revenue": 80000,
      "cost": 57600,
      "profit": 22400,
      "margin": 28.0
    }
  ]
}
```

| Field | Definition |
|-------|-----------|
| `unitsSold` | Total quantity sold across orders |
| `revenue` | Net sales for the product (ex-GST) |
| `cost` | COGS for the product (`Σ costPrice × qty`) |
| `profit` | `revenue − cost` |
| `margin` | `profit / revenue × 100` (0–100) |

If there is no data, return `{ "metric": "...", "data": [] }` (the frontend shows
an empty state). The frontend uses `retry: false` so a 404 also resolves to the
empty state, but returning `200` with an empty array is preferred.

---

## 6. Historical order backfill (one-time migration)

### Problem

Section §2 snapshots `costPrice` only when **new** orders are created. Orders
placed before purchase-price tracking went live have `costPrice` / `costTotal` /
`profitTotal` missing. Dashboard charts then show:

- **Revenue** for the full range (correct)
- **Cost** only for recent orders (last few days)
- **Profit** incorrectly equal to revenue on older buckets when the API sets
  `profit = revenue − 0`

Production data (Jul 2026) showed ~80% of non-cancelled orders without cost
snapshots while products already had `purchasePrice` set.

### Goal

Backfill historical line items so **all non-cancelled orders** have consistent
`costPrice`, `costTotal`, and `profitTotal`, enabling accurate dashboard
metrics, revenue-trend series, and top-products for the full order history.

### Scope

| Include | Exclude |
|---------|---------|
| All orders with `status !== "cancelled"` | Cancelled orders |
| Line items missing `costPrice` | Line items that already have `costPrice` (idempotent) |

### Backfill rules

For each order line item where `costPrice` is `null`, `undefined`, or absent:

1. Load the product referenced by `productId` (use populated snapshot or join).
2. Set `costPrice = product.purchasePrice` (use `0` only if the product truly
   has `purchasePrice = 0`).
3. Set `lineCost = round(costPrice × quantity, 2)`.
4. Recompute order totals:
   - `costTotal = Σ lineCost` across items
   - `profitTotal = subtotal − costTotal` (ex-GST, same basis as §2)

**Do not** change `unitPrice`, `lineTotal`, `subtotal`, `discountTotal`,
`gstTotal`, or `grandTotal` — only cost/profit fields.

### Important caveats (communicate to stakeholders)

- Backfill uses each product's **current** `purchasePrice`, not the supplier
  price at the original order date. This is the best available default unless
  historical cost records exist elsewhere.
- Products with `purchasePrice = 0` will still show 100% margin until those
  products are updated.
- Re-running the migration must be **idempotent**: skip items that already have
  `costPrice` set (including orders created after the feature shipped).

### Suggested migration script (pseudocode)

```js
for (const order of orders.where({ status: { $ne: "cancelled" } })) {
  let changed = false;
  let costTotal = 0;

  for (const item of order.items) {
    if (item.costPrice != null) {
      costTotal += item.lineCost ?? item.costPrice * item.quantity;
      continue;
    }

    const product = await Product.findById(item.productId);
    const costPrice = round(product?.purchasePrice ?? 0, 2);
    const lineCost = round(costPrice * item.quantity, 2);

    item.costPrice = costPrice;
    item.lineCost = lineCost;
    costTotal += lineCost;
    changed = true;
  }

  if (changed) {
    order.costTotal = round(costTotal, 2);
    order.profitTotal = round(order.subtotal - order.costTotal, 2);
    await order.save();
  }
}
```

Run in a transaction or batched job; log counts: orders scanned, orders updated,
items backfilled, items skipped (no product / missing `purchasePrice`).

### Downstream endpoints to refresh after backfill

No cache layer is assumed, but verify these return updated totals immediately:

| Endpoint | Expected change |
|----------|-----------------|
| `GET /api/orders`, `GET /api/orders/:id` | `costPrice`, `lineCost`, `costTotal`, `profitTotal` on old orders |
| `GET /api/dashboard/metrics` | Higher `totalCost`, lower `grossProfit` / `profitMargin` |
| `GET /api/dashboard/revenue-trend` | `cost` and `profit` on historical buckets |
| `GET /api/dashboard/top-products` | Non-zero `cost`, realistic `margin` (not 100%) |

### Verification checklist

1. Pick an order from before the feature launch date — confirm `costTotal > 0`
   and `profitTotal = subtotal − costTotal`.
2. Pick a post-launch order — confirm backfill did **not** overwrite its
   snapshotted `costPrice`.
3. `GET /api/dashboard/revenue-trend?range=14d` — buckets with revenue should
   also have `cost > 0` and `profit < revenue` after backfill.
4. `summary.totalProfit` must equal `sum(series[*].profit)` (after rounding).
5. Cancelled orders unchanged.

### Optional dry-run mode

Support `?dryRun=true` on an admin-only migration route (or CLI flag) that
returns `{ ordersAffected, itemsAffected, estimatedTotalCost, estimatedTotalProfit }`
without writing.

---

## 7. Tests / validation to update

- Product create/update scenarios: include `purchasePrice`; reject negative
  values (`400`).
- Product read schema: add `purchasePrice`.
- Order read schema: add item `costPrice`/`lineCost` and order
  `costTotal`/`profitTotal`.
- Dashboard metrics schema: add the four new fields.
- Add coverage for the new `top-products` endpoint.
- **Backfill migration**: order with missing `costPrice` gets product
  `purchasePrice`; existing `costPrice` left unchanged; cancelled orders skipped;
  `revenue-trend` bucket omits `profit` when no snapshotted cost (pre-backfill).

---

## Frontend touch points (already done — for reference)

| Area | File |
|------|------|
| Shared helpers (`getProfit`, `getMarginPercent`, `formatPercent`) | `lib/utils.ts` |
| Product type + payloads | `app/api/products/use-get-all.ts`, `use-create.ts`, `use-update.ts` |
| Product form (field + live margin) | `components/admin/products/product-form.tsx` |
| Product list + details | `components/admin/products/index.tsx`, `product-details-dialog.tsx` |
| Order types | `app/api/orders/use-get-all.ts`, `app/api/customers/use-get-customer-orders.ts` |
| Order items table + summary | `components/admin/orders/order-items-table.tsx`, `order-summary-card.tsx` |
| Order create form (live profit) | `components/orders/order-form.tsx` |
| Dashboard metrics + KPIs | `app/api/dashboard/use-dashboard-metrics.ts`, `components/admin/dashboard/index.tsx` |
| Revenue/cost/profit trend | `app/api/dashboard/use-dashboard-revenue-trend.ts`, `components/admin/dashboard/revenue-trend.tsx` |
| Top products card + hook | `app/api/dashboard/use-dashboard-top-products.ts`, `components/admin/dashboard/top-products.tsx` |
