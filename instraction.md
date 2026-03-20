# Frontend Integration Instruction: Wiki Public Profile Contract (Latest)

## Objective
Use wiki backend contract so everything edited in:
- `/user/profile/edit`
- `/user/profile/bio`

is visible on:
- `/wiki/{username}`

## Backend APIs
- `GET /api/v1/wiki/public/{username}`
- `GET /api/v1/wiki/me`
- `POST /api/v1/wiki/me/update`
- `POST /api/v1/wiki/me/bio`

## Public Profile Fields (consume from `GET /api/v1/wiki/public/{username}`)
Required keys:
- `username`
- `first_name`
- `last_name`
- `display_name`
- `full_name` (preferred)
- `email`
- `photo`
- `avatar_url` (preferred)
- `phone`
- `city`
- `state`
- `country`
- `location_text` (preferred)
- `address`
- `birthday`
- `website`
- `interests`
- `study`
- `degree`
- `mission`
- `profession`
- `nationality`
- `organization`
- `social_links` (array: `{ provider, url }`)
- `bio_details`
- `is_blue_verified` (boolean)

## Frontend precedence rules
Use these exact fallback rules:
- Name:
  1. `full_name`
  2. `first_name + last_name`
  3. `display_name`
- Avatar:
  1. `avatar_url`
  2. `photo`
- Location:
  1. `location_text`
  2. join non-empty `city`, `state`, `country`

## Blue verified behavior
- `is_blue_verified` is read-only from frontend.
- Do not send `is_blue_verified` in `POST /api/v1/wiki/me/update`.
- Badge render rule:
```ts
const showVerifiedBadge = user.is_blue_verified === true
```

## Update ownership
- `POST /api/v1/wiki/me/update` owns profile fields.
- `POST /api/v1/wiki/me/bio` owns only `bio_details`.
- Public endpoint reads the same persisted wiki row, so profile/bio updates must appear on public profile.

## Social links note
For multipart update with file upload, send `social_links` as JSON string.

Allowed providers:
- `facebook`, `twitter`, `linkedin`, `dribbble`, `github`, `website`

## Response shape
Success:
```json
{ "message": "...", "user": { ... } }
```

Error:
```json
{ "message": "...", "errors": { "field": ["..."] } }
```
