# Backend foundation

## Admin session helpers

`src/lib/auth.ts` provides signed, eight-hour, HTTP-only admin cookies:

- After checking a password in the login handler, call `createAdminSession(user.id)`.
- In every admin Route Handler, call `getAdminSession()` and return `unauthorized()` from `src/lib/api-response.ts` when it returns `null`.
- Call `clearAdminSession()` from logout.

The helper verifies the signature and expiry, then checks the user's current role in PostgreSQL on every request. Do authorization inside each protected Route Handler; Next.js 16 `proxy.ts` is suitable for redirects or optimistic UI checks, not the security boundary for API mutations. Do not return password hashes or session tokens in API responses.

Set `AUTH_SECRET` to a cryptographically random value of at least 32 characters in every environment. Passwords in `users.password` must contain a password hash, never the submitted password. The `server-only` guard prevents this module from being imported into client bundles.

## Queue rules to keep consistent

- Define “today” in `Asia/Jakarta` and use that same business date for queue creation and admin filters; database/server UTC date can differ near midnight.
- Allocate numbers per `(id_booth, date)`. The schema's unique constraint protects that invariant, but concurrent submissions still need collision handling (retry after a unique-constraint conflict, or serialize allocation per booth/date).
- Persist `estimatedEndAt` when creating the queue as `createdAt + 5 minutes`. On extension, add five minutes to the existing estimate (or to now if the estimate has passed) and set status to `EXTENDED`; do not derive the estimate from `updatedAt`, since unrelated edits change it.
- The current schema has no “current turn” or session identifier. End/extend requests need a queue `id` (prefer a route such as `/api/queue/[id]/end-session`) or an explicit booth plus active queue selection rule. Do not update every queue based only on `queue_status`.
- Use `Queue.publicToken`, never the internal queue `id`, in customer-facing URLs and cancellation/status requests. It is an opaque, unique identifier intended to limit enumeration of queue records.
- Decide and enforce allowed status transitions. For example, only `WAITING` can be canceled; only the active `IN_TURN` queue can be ended or extended. Use conditional updates/transactions so two admins cannot finish the same queue inconsistently.
- Return only the fields needed by each public endpoint. Keep phone numbers and admin-only queue data out of public responses.

## Route organization

Use App Router Route Handlers under `src/app/api/**/route.ts`; dynamic segments are folders such as `src/app/api/queue/[id]/route.ts`. Keep handlers thin: validate input, call a service, and map errors with `apiError()` / `unauthorized()`. Put database/business logic in `src/lib` so status rules and number allocation are shared rather than reimplemented in separate branch handlers.

## Local configuration and seeding

Copy `.env.example` to `.env`, fill in the PostgreSQL URLs and a random `AUTH_SECRET`, then set a unique `SEED_ADMIN_PASSWORD` before running `npm run db:seed`. The seed intentionally does not include or print a default password. It only creates an admin when the configured email does not already exist.

Suggested common response shape for errors:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

