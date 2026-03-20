# Secure Wiki Auth/Profile Integration

## 1) File-by-file implementation list

- `middleware.ts`: Protects `/dashboard/*` and redirects authenticated users away from auth pages.
- `lib/auth/constants.ts`: Server-only env handling and cookie constants.
- `lib/auth/types.ts`: Typed backend/frontend contract shapes.
- `lib/auth/schemas.ts`: Zod validation for all auth/profile flows.
- `lib/auth/cookies.ts`: HTTP-only cookie set/read/clear helpers.
- `lib/auth/server-api.ts`: Centralized Laravel API wrapper + normalized error mapping.
- `lib/auth/route-helpers.ts`: Shared request parsing and response helpers for route handlers.
- `lib/auth/session.ts`: Server-side auth token guard helpers.
- `lib/auth/profile.ts`: Server-side current-user fetch helper with invalid-token cleanup.
- `lib/auth/client-errors.ts`: Client form helpers for backend field-error rendering.
- `app/api/auth/register/route.ts`: BFF register proxy + token cookie set.
- `app/api/auth/login/route.ts`: BFF login proxy + token cookie set.
- `app/api/auth/logout/route.ts`: Clears auth cookie.
- `app/api/auth/forgot-password/route.ts`: BFF forgot password proxy.
- `app/api/auth/reset-password/route.ts`: BFF reset password proxy.
- `app/api/profile/me/route.ts`: BFF profile detail proxy using cookie token.
- `app/api/profile/update/route.ts`: BFF profile update proxy + safelisted payload forwarding.
- `app/api/profile/change-password/route.ts`: BFF change password proxy + forced logout.
- `app/dashboard/layout.tsx`: Server-side guard for protected dashboard routes.
- `app/page.tsx`: Redirects users to `/dashboard` or `/login` based on server cookie.
- `app/login/page.tsx`, `app/signup/page.tsx`: Auth pages with new secure form flows.
- `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`: Password recovery pages.
- `app/dashboard/page.tsx`: SSR dashboard with profile summary and secure sign-out.
- `app/dashboard/profile/page.tsx`: SSR profile details page.
- `app/dashboard/profile/edit/page.tsx`: Profile update page using BFF endpoint.
- `app/dashboard/change-password/page.tsx`: Change password page.
- `components/login-form.tsx`: RHF + Zod login form with backend error rendering.
- `components/signup-form.tsx`: RHF + Zod register form.
- `components/forgot-password-form.tsx`: RHF + Zod forgot-password form.
- `components/reset-password-form.tsx`: RHF + Zod reset-password form.
- `components/profile/profile-update-form.tsx`: Full-field profile update form.
- `components/profile/change-password-form.tsx`: Change password form with forced re-login UX.
- `components/logout-button.tsx`: Internal API logout trigger.
- `package.json`, `package-lock.json`: Added `zod`, `react-hook-form`, `@hookform/resolvers`.

## 2) Environment variable list

- `WIKI_API_BASE_URL` (required, server-only): Laravel API base URL, e.g. `https://api.example.com`.
- `WIKI_AUTH_COOKIE_MAX_AGE` (optional, server-only): Cookie max age in seconds.

Notes:
- Do **not** use `NEXT_PUBLIC_` prefix for backend API URL.
- Cookie name is fixed to `wiki_auth_token`.

## 3) Route map

- Frontend `POST /api/auth/register` -> Next handler `/api/auth/register` -> Laravel `POST /api/v1/wiki/auth/register`
- Frontend `POST /api/auth/login` -> Next handler `/api/auth/login` -> Laravel `POST /api/v1/wiki/auth/login`
- Frontend `POST /api/auth/logout` -> Next handler `/api/auth/logout` -> clears cookie (no Laravel call)
- Frontend `POST /api/auth/forgot-password` -> Next handler `/api/auth/forgot-password` -> Laravel `POST /api/v1/wiki/auth/forgot-password`
- Frontend `POST /api/auth/reset-password` -> Next handler `/api/auth/reset-password` -> Laravel `POST /api/v1/wiki/auth/reset-password`
- Frontend `GET /api/profile/me` -> Next handler `/api/profile/me` -> Laravel `GET /api/v1/wiki/me`
- Frontend `POST /api/profile/update` -> Next handler `/api/profile/update` -> Laravel `POST /api/v1/wiki/me/update`
- Frontend `POST /api/profile/change-password` -> Next handler `/api/profile/change-password` -> Laravel `POST /api/v1/wiki/me/change-password`

## 4) Typed contracts

Core types in `lib/auth/types.ts`:
- `WikiUser`
- `AuthSuccessResponse`
- `MessageOnlyResponse`
- `MeResponse`
- `BackendErrorResponse`
- `ApiErrorShape`

Core request schemas in `lib/auth/schemas.ts`:
- `registerSchema`
- `loginSchema`
- `forgotPasswordSchema`
- `bioSchema` (frontend/BFF max 1000 chars; backend may still allow 5000 until backend validation is updated)
- `resetPasswordSchema`
- `updateProfileSchema` (strict + safelisted forwarding)
- `changePasswordSchema`

## 5) Test checklist

1. Register success + validation failures.
2. Login success + wrong credentials + 429 throttle handling.
3. Forgot password success + invalid email.
4. Reset password success + invalid token + mismatched confirmation.
5. Middleware redirect checks:
   - no cookie -> `/dashboard/*` redirects to `/login`
   - with cookie -> `/login` and `/signup` redirect to `/dashboard`
6. `/api/profile/me` with valid token, missing token, invalid token.
7. Profile update success + duplicate email/username + invalid website/email.
8. Change password wrong current + valid current; confirm forced re-login.
9. Token leak audit:
   - token not in `localStorage` or `sessionStorage`
   - browser only calls internal Next `/api/*` routes
   - Laravel base URL absent from client-exposed env vars

## 6) curl examples

Assume app runs on `http://localhost:3000`.

### Register
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email":"user@example.com",
    "username":"user01",
    "first_name":"Test",
    "last_name":"User",
    "password":"password123",
    "password_confirmation":"password123"
  }'
```

### Login
```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Logout
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

### Forgot password
```bash
curl -i -X POST http://localhost:3000/api/auth/forgot-password \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com"}'
```

### Reset password
```bash
curl -i -X POST http://localhost:3000/api/auth/reset-password \
  -H 'Content-Type: application/json' \
  -d '{
    "token":"RESET_TOKEN",
    "email":"user@example.com",
    "password":"newpassword123",
    "password_confirmation":"newpassword123"
  }'
```

### Get current user
```bash
curl -i -b cookies.txt http://localhost:3000/api/profile/me
```

### Update profile
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/profile/update \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name":"Updated",
    "last_name":"User",
    "email":"user@example.com",
    "username":"user01",
    "phone":"123456789",
    "city":"Dhaka",
    "state":"Dhaka",
    "country":"Bangladesh",
    "address":"Road 1",
    "birthday":"1995-01-01",
    "interests":"tech",
    "study":"CS",
    "degree":"BSc",
    "website":"https://example.com",
    "photo":"https://example.com/photo.jpg"
  }'
```

### Change password (forces logout)
```bash
curl -i -b cookies.txt -X POST http://localhost:3000/api/profile/change-password \
  -H 'Content-Type: application/json' \
  -d '{
    "current_password":"password123",
    "new_password":"newpassword123",
    "new_password_confirmation":"newpassword123"
  }'
```

## 7) Security checklist confirmation

- [x] Token is never stored in `localStorage` or `sessionStorage`.
- [x] Token is stored only in HTTP-only cookie `wiki_auth_token`.
- [x] Laravel auth/profile endpoints are called only from server-side route handlers.
- [x] Browser-facing calls use internal Next `/api/*` endpoints.
- [x] Laravel base URL sourced from server-only `WIKI_API_BASE_URL`.
- [x] Protected routes are checked in middleware and server-rendered route guard.
- [x] Request and response contracts are typed with centralized schemas/types.
- [x] Profile update forwards only safelisted fields.
- [x] Change-password success clears cookie and requires re-login.
