# Backend Handoff: Dashboard Revenue Trend API

## Problem being solved

The dashboard currently shows:

- KPI **Total revenue** from `/api/dashboard/metrics`
- Revenue chart computed on frontend from a paginated subset of orders

This can create mismatches (for example, chart total for 90 days being greater than KPI total revenue) because frontend aggregation is limited by client-side pagination and local bucketing logic.

To make numbers deterministic and audit-friendly, backend should own the trend aggregation and provide a dedicated API for the revenue chart.

## Goal

Provide one backend endpoint that:

1. Returns pre-aggregated revenue buckets for the selected range.
2. Returns a **range total** computed with the exact same business rules as metrics.
3. Uses the same inclusion/exclusion rules as dashboard metrics (especially cancelled orders handling), so KPI and chart remain consistent.

## Proposed endpoint

- **Method:** `GET`
- **Path:** `/api/dashboard/revenue-trend`

### Query params

- `range` (required): one of `7d | 14d | 30d | 90d`
- `timezone` (optional): IANA timezone string, default `Asia/Karachi`

### Response (recommended contract)

```json
{
  "range": "90d",
  "granularity": "week",
  "timezone": "Asia/Karachi",
  "summary": {
    "totalRevenue": "2206616.12",
    "orderCount": 180,
    "currency": "PKR",
    "excludedStatuses": ["cancelled"]
  },
  "series": [
    {
      "bucketStart": "2026-03-01",
      "bucketEnd": "2026-03-07",
      "label": "01 Mar",
      "revenue": "150000.00",
      "orderCount": 12
    }
  ]
}
```

## Required business rules (must match metrics)

Use exactly the same rules used by `/api/dashboard/metrics`:

1. Revenue basis must match KPI `totalRevenue` basis (same source field, same statuses, same rounding).
2. Exclude cancelled orders from chart and range totals.
3. Use a single timezone-aware bucketing strategy for both filtering and grouping.
4. Always return all buckets in the requested range, including zero-revenue buckets.
5. Return monetary values as decimal-safe numbers/strings compatible with existing API currency handling.

## Bucket definitions

- `7d`, `14d`, `30d` -> **daily buckets**
- `90d` -> **weekly buckets**

For weekly buckets, define and document:

- week start day (recommended: Sunday to match current frontend behavior)
- bucket boundaries as inclusive start and end at day precision in selected timezone

## Consistency invariant

For any selected range:

- `summary.totalRevenue` must equal `sum(series[*].revenue)` after numeric parsing/rounding rules.

For full-lifetime metric comparisons:

- If range window covers all historical data, `summary.totalRevenue` should equal dashboard KPI `metrics.totalRevenue`.

## Validation and error handling

- Reject invalid `range` with `400`.
- Fallback timezone to default if missing; reject malformed timezone with `400`.
- Keep response shape stable so frontend does not need transform logic.

## Performance guidance

- Perform aggregation in database (group by date bucket), not in application loops over full datasets.
- Add/ensure index support on `createdAt` and `status`.
- Return only aggregated points and summary, not raw orders.

## Frontend integration expectation

Frontend will call:

- `/api/dashboard/revenue-trend?range=<7d|14d|30d|90d>`

And will:

- render `series` directly
- display `summary.totalRevenue` in chart header
- stop doing client-side order fetching/aggregation for this chart

This removes ambiguity and keeps chart totals aligned with dashboard metrics logic.
