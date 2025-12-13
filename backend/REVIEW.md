# Backend Review

## Overview
The backend is an Express application configured in [`src/server.ts`](src/server.ts) with middleware for CORS, Helmet, JSON body parsing, and request logging. Health check routing is exposed under `/api/health` and authentication routes under `/api/auth`. A root `GET /` endpoint returns a JSON status payload.

## Configuration
Environment variables are validated with Zod in [`src/config/env.ts`](src/config/env.ts). Required settings include `DATABASE_URL` and `JWT_SECRET`, with defaults for `NODE_ENV` and `PORT`. Prisma is instantiated via [`src/config/database.ts`](src/config/database.ts) and uses generated client bindings from `src/generated/prisma`.

## Authentication Flow
Authentication handlers live in [`src/controllers/auth.controller.ts`](src/controllers/auth.controller.ts) and rely on Zod schemas in [`src/routes/validators/auth.schema.ts`](src/routes/validators/auth.schema.ts).

- **Registration**: Validates input, checks for existing users, hashes passwords with bcrypt, stores the user, and returns a JWT plus user profile.
- **Login**: Validates input, verifies credentials against stored hashes, and returns a JWT plus user profile.

JWT utilities in [`src/utils/jwt.ts`](src/utils/jwt.ts) issue 7‑day tokens signed with the configured secret. The `requireAuth` middleware in [`src/middleware/auth.ts`](src/middleware/auth.ts) enforces bearer token validation for protected routes.

## Error Handling
Errors are captured by a simple error handler in [`src/middleware/error-handler.ts`](src/middleware/error-handler.ts) which logs the error and returns a 500 response.

## Routes
Route wiring is defined in [`src/routes/auth.routes.ts`](src/routes/auth.routes.ts) and [`src/routes/health.ts`](src/routes/health.ts). Authentication routes include `POST /api/auth/register` and `POST /api/auth/login`. The health route responds with `{ status: "healthy" }` for `GET /api/health/`.

## Recommendations
- Add automated tests covering authentication flows and environment parsing.
- Extend error handling to return structured error codes and capture Prisma validation errors.
- Document required environment variables and Prisma migration steps in a README for onboarding.
