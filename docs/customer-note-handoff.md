# Backend Handoff — Customer Note (dedicated, editable)

The frontend now has a **dedicated customer-level note** — a free-text field
saved **directly on the customer**, separate from the opening-balance ledger
note. This is what the client asked for: a place to store important context /
information about a customer.

The frontend UI and types are already implemented and wired. This document
specifies the backend changes needed so the field actually persists and is
returned.

## Context / how it differs from the existing note

There are now **two distinct notes**:

| Note | Where it lives | Editable | Shown on profile |
|------|----------------|----------|------------------|
| **Customer note** (this doc) | Directly on the `Customer` model (`note`) | Yes (create + edit) | Yes — dedicated "Note" card |
| Opening-balance note (existing) | On the opening-balance ledger adjustment | No (set once at signup) | No — visible in Transaction history only |

Do **not** merge these. The opening-balance note stays exactly as-is
(`balanceAdjustment.note` on create, surfaced read-only via `openingBalanceNote`
on the detail response). This handoff only adds the new `note` field on the
customer entity.

## Conventions

- `note` is a plain, optional string. No length cap needed beyond a sane max
  (e.g. 2000 chars) if you want one.
- Empty string means "no note" — treat `""` and absent the same. Frontend hides
  the note card when the value is empty/whitespace.

---

## 1. Data model

Add a `note` field to the Customer schema:

- `note: string` — optional, defaults to `""` (or `null`). Free text.

---

## 2. `POST /api/customers` (create)

Accept an optional top-level `note` in the request body and persist it on the
customer.

Request body (note the new top-level `note`, alongside the existing
`balanceAdjustment`):

```json
{
  "firstName": "City",
  "lastName": "Pharmacy",
  "email": "purchase@citypharmacy.com.pk",
  "phoneNumber": "03211234567",
  "streetAddress": "45 Mall Road, Gulberg II",
  "city": "Lahore",
  "state": "Punjab",
  "note": "Prefers delivery after 5pm. Verbal discount agreed with owner.",
  "balanceAdjustment": {
    "amount": 15000,
    "direction": "customer_owes",
    "note": "Carried forward from December 2025 statement"
  }
}
```

- `note` → saved on the customer.
- `balanceAdjustment.note` → unchanged; stays on the opening-balance ledger
  entry (this is the note shown in Transaction history / returned as
  `openingBalanceNote`).

---

## 3. `PATCH /api/customers/:id` (update)

Accept an optional `note` and update it on the customer. The frontend **always
sends `note`** on edit (trimmed), including an empty string when the user clears
it — so the backend should set the field to whatever is sent (allowing the note
to be cleared).

```json
{
  "firstName": "City",
  "note": "Updated: now on 30-day credit terms."
}
```

---

## 4. Reads — return `note`

Include `note` on:

- **`GET /api/customers/:id`** (detail) — required; this powers the "Note" card
  and pre-fills the edit form.
- **`GET /api/customers`** (list) — please include it too (the frontend list
  type already allows it; useful for future list indicators). Optional but
  preferred.

Detail response example:

```json
{
  "_id": "665f...",
  "firstName": "City",
  "lastName": "Pharmacy",
  "email": "purchase@citypharmacy.com.pk",
  "phoneNumber": "03211234567",
  "streetAddress": "45 Mall Road, Gulberg II",
  "city": "Lahore",
  "state": "Punjab",
  "note": "Prefers delivery after 5pm. Verbal discount agreed with owner.",
  "openingBalanceNote": "Carried forward from December 2025 statement",
  "balance": { "...": "existing balance object, unchanged" }
}
```

`note` (customer note) and `openingBalanceNote` (read-only, from the ledger) are
**both** returned and are independent of each other.

---

## 5. Tests / validation to update

- Customer create scenario: send `note`, assert it persists and is returned.
- Customer update scenario: update `note`, and clear it (`""`), assert both.
- Customer detail schema: add optional `note`.

---

## Frontend touch points (already done — for reference)

| Area | File |
|------|------|
| Customer list type | `app/api/customers/use-get-all.ts` (`note?`) |
| Customer detail type | `app/api/customers/use-get-by-id.ts` (`note?`) |
| Create payload + response | `app/api/customers/use-create.ts` (`note?`) |
| Update payload + response | `app/api/customers/use-update.ts` (`note?`) |
| Create/edit form (Note field, sends `note`) | `components/admin/customers/customer-form.tsx` |
| Detail page "Note" card | `components/admin/customers/customer-detail.tsx` |
