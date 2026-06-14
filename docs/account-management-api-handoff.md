# Account Management API Handoff

**Status:** Integrated with live backend (see backend handoff for env/deployment).

This document describes the backend APIs the Saiban frontend expects for login-adjacent account management. The UI and Next.js BFF routes proxy to these endpoints.

## Architecture overview

```
Browser → Next.js BFF (/api/auth/*) → Backend API (API_URL/api/auth/*)
```

- **Public flows** (forgot/reset password): browser calls Next.js routes directly; no session cookie required.
- **Authenticated flows** (profile, change password): Next.js reads the `auth-token` HttpOnly cookie and forwards `Authorization: Bearer <token>` to the backend.
- **Login/register** already work today and are included here for reference only.

### Frontend routes (already built)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Request password reset email |
| `/reset-password?token=...` | Set new password from email link |
| `/admin/account` | In-app profile + change password (requires session) |

### Next.js BFF routes (proxy to backend)

| BFF route | Method | Upstream path |
|-----------|--------|---------------|
| `/api/auth/login` | POST | `/api/auth/login` |
| `/api/auth/register` | POST | `/api/auth/register` |
| `/api/auth/logout` | POST | *(local only — clears cookie)* |
| `/api/auth/forgot-password` | POST | `/api/auth/forgot-password` |
| `/api/auth/reset-password` | POST | `/api/auth/reset-password` |
| `/api/auth/change-password` | POST | `/api/auth/change-password` |
| `/api/auth/profile` | PATCH | `/api/auth/profile` |
| `/api/auth/me` | GET | `/api/auth/me` |

Environment: `API_URL` (server) or `NEXT_PUBLIC_API_URL` must point at the backend base URL.

---

## Existing endpoints (reference)

### `POST /api/auth/login`

**Request**
```json
{ "email": "user@example.com", "password": "secret123" }
```

**Success `200`**
```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "admin"
  }
}
```

**Errors**: `400` validation, `401` invalid credentials. Body should include `message` (string).

### `POST /api/auth/register`

**Request**
```json
{ "name": "Jane Doe", "email": "user@example.com", "password": "secret123" }
```

**Backend success `200`** — matches login:
```json
{
  "access_token": "<jwt>",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "role": "admin"
  }
}
```

**BFF behavior:** Sets the `auth-token` cookie from `access_token` and returns `{ user }` to the client (same as login).

---

## New endpoints to implement

### 1. `POST /api/auth/forgot-password`

Initiates a password reset. Must be safe to call without revealing whether the email exists.

**Request**
```json
{ "email": "user@example.com" }
```

**Success `200`** (always return success for valid email format, even if user not found)
```json
{ "message": "If an account exists, a reset link has been sent." }
```

**Errors**
- `400` — invalid email format
- `429` — rate limited (optional but recommended)

**Email link format**

The reset email should contain a link to the frontend:

```
{FRONTEND_URL}/reset-password?token={opaque_reset_token}
```

- `FRONTEND_URL` — e.g. `https://app.saiban.com` or `http://localhost:3000` in dev.
- Token should be single-use, cryptographically random, and expire (frontend copy assumes **1 hour**).
- Do not require the user to be logged in to use the link.

**Security notes**
- Do not return different responses for unknown vs known emails.
- Throttle by IP and/or email.
- Invalidate token after successful reset.

---

### 2. `POST /api/auth/reset-password`

Completes the forgot-password flow using the token from the email.

**Request**
```json
{
  "token": "opaque-token-from-email",
  "password": "newSecret123"
}
```

**Success `200`**
```json
{ "message": "Password updated successfully" }
```

**Errors**
- `400` — invalid/expired token, weak password, validation errors
- `404` — token not found (may be folded into `400` with a generic message)

**Behavior**
- Validate password (minimum 6 characters matches frontend; align with register rules).
- Hash and persist new password.
- Invalidate the reset token (and ideally all outstanding reset tokens for that user).
- Do **not** auto-login; frontend redirects to `/login`.

---

### 3. `POST /api/auth/change-password` *(authenticated)*

Allows a signed-in user to change password from **Account settings** (`/admin/account`).

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{
  "currentPassword": "oldSecret123",
  "newPassword": "newSecret456"
}
```

**Success `200`**
```json
{
  "message": "Password updated successfully",
  "access_token": "<new-jwt>"
}
```

**BFF behavior:** Replaces the `auth-token` cookie with the new `access_token`. Returns `{ message }` only to the client. User stays signed in on the current device; other sessions are invalidated server-side.

---

### 4. `PATCH /api/auth/profile` *(authenticated)*

Updates the user's display name from **Account settings**.

**Headers**
```
Authorization: Bearer <access_token>
```

**Request**
```json
{ "name": "Jane Doe" }
```

**Success `200`**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "admin"
  }
}
```

**Errors**
- `401` — missing/invalid token
- `400` — name too short (frontend requires min 2 characters)

**Notes**
- Email is **read-only** in the UI; no email-change endpoint is required for this phase.
- Response `user` shape should match login/register `user` object so the frontend can sync local state.

---

## Error response format

The frontend uses `parseApiErrorMessage` (`lib/api-error.ts`) to read errors:

1. `message` (string) — preferred
2. `message` (string array) — first entry (NestJS validation)
3. `error` (string) — fallback

Example:
```json
{ "message": "Current password is incorrect", "statusCode": 400 }
```

Forgot-password rate limits (`429`) show a dedicated user-friendly toast in the UI.

---

## Auth middleware

Protected routes (`change-password`, `profile`) must validate the JWT from `Authorization: Bearer`. This matches how other protected backend routes already work for `/api/products`, etc.

---

## Implementation checklist

- [x] `POST /api/auth/forgot-password`
- [x] `POST /api/auth/reset-password`
- [x] `POST /api/auth/change-password`
- [x] `PATCH /api/auth/profile`
- [x] Register BFF auto-login after signup
- [x] NestJS array `message` parsing
- [x] `429` handling on forgot-password
- [x] `GET /api/auth/me` — session hydration on admin load

---

## Frontend integration

Integrated. Confirm `API_URL` in `.env` points at the running backend, then smoke-test:

1. Forgot password → email (or backend log in dev) → reset link → login
2. Account settings → update name → sidebar reflects change
3. Account settings → change password → stay logged in → logout → login with new password
4. Register → auto-login → redirect to dashboard

### Files to reference on the frontend

| Concern | Location |
|---------|----------|
| Error message parsing | `lib/api-error.ts` |
| Forgot password UI | `components/auth/forgot-password.tsx` |
| Reset password UI | `components/auth/reset-password.tsx` |
| Account settings UI | `components/account/` |
| Sidebar account menu | `components/nav-user.tsx` |
| React Query hooks | `app/api/auth/use-*.ts` |
| BFF routes | `app/api/auth/*/route.ts` |

---
