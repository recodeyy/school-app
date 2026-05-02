# Authentication & Organization Bootstrap

This document summarizes the authentication flow and the organization bootstrap process implemented in the backend.

## Overview

The system currently supports:

- email/password login
- JWT access tokens
- JWT refresh tokens
- role-based account creation
- Swagger documentation for auth endpoints
- a bootstrap script for creating a new tenant/organization and its first principal account

The backend uses:

- NestJS for the API layer
- Prisma for database access
- PostgreSQL with a multi-schema setup (`public` and `tenant`)
- `bcrypt` for password hashing
- `@nestjs/jwt` for signing and verifying tokens
- `class-validator` for DTO validation
- `@nestjs/swagger` for API documentation

## Authentication flow

### 1. User login

A user logs in with:

- `email`
- `password`

The server:

1. looks up the user by email
2. compares the supplied password with the stored `passwordHash`
3. returns JWT access and refresh tokens if the credentials are valid

### 2. Token generation

Tokens are generated in `AuthService.getTokens()`.

- Access token secret: `JWT_SECRET`
- Refresh token secret: `JWT_REFRESH_SECRET`
- Access token expiry: `JWT_EXPIRES_IN`
- Refresh token expiry: `JWT_REFRESH_EXPIRES_IN`

Fallback values exist in code for local development, but production should always provide real secrets through environment variables.

### 3. Refresh flow

The refresh endpoint accepts a refresh token and:

1. verifies the token signature
2. checks that the `sub` claim exists
3. loads the user from the database
4. rejects disabled or missing users
5. returns a fresh pair of tokens

### 4. Role-protected account creation

The account creation endpoint is protected by:

- `JwtAuthGuard`
- `RolesGuard`

Allowed roles:

- `ADMIN`
- `SUPER_ADMIN`
- `PRINCIPAL`
- `ADMISSION_COUNSELOR`

## Auth endpoints

| Method | Path            | Description                              |
| ------ | --------------- | ---------------------------------------- |
| `POST` | `/auth/login`   | Authenticates a user and returns tokens  |
| `POST` | `/auth/refresh` | Exchanges a refresh token for new tokens |
| `POST` | `/auth/create`  | Creates a new user account               |

## DTO validation

Validation is enabled globally with `ValidationPipe`.

Configured behavior:

- `whitelist: true` — strips unknown fields
- `forbidNonWhitelisted: true` — rejects unknown fields
- `transform: true` — transforms payloads to DTO instances

### DTO rules

#### `LoginDto`

- `email` must be a valid email
- `password` must be a string with minimum length 8

#### `RefreshTokenDto`

- `refreshToken` must be a string with minimum length 10

#### `CreateUserDto`

- `name` must be a string with minimum length 2
- `email` must be a valid email
- `password` must be a string with minimum length 8
- `role` is optional and must be one of the supported user roles

## Swagger documentation

Swagger UI is enabled in `src/main.ts` and exposed at:

- `/docs`

Swagger metadata was added to:

- auth controller routes
- auth DTOs

This allows the login, refresh, and create-account endpoints to be tested directly from the browser.

## Prisma and database access

`PrismaService` was updated for Prisma 7 + PostgreSQL adapter usage.

Current behavior:

- creates a `pg` connection pool
- passes the pool into Prisma through `PrismaPg`
- connects on module init
- disconnects and closes the pool on shutdown

Important env var:

- `DATABASE_URL`

## Environment variables

The auth system expects these variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN` (optional)
- `JWT_REFRESH_EXPIRES_IN` (optional)
- `PORT` (optional)

## Organization Creation Script (OCS)

A bootstrap script was added at `scripts/OCS.ts`.

### What it does

The script creates:

- a new tenant record in `public.tenants`
- a tenant schema if it does not exist
- the first principal user in `tenant.users`

### Why it exists

It is meant for the first-time setup of a new organization/tenant.

Instead of manually inserting data, the script handles:

- tenant creation
- schema creation
- password hashing
- principal account creation
- enum compatibility fixes for older databases

### Principal login

The script creates a user with role `PRINCIPAL`, which can then log in using the regular auth flow:

- `POST /auth/login`

### Example usage

```bash
npm run ocs -- --name "My School" --slug "my-school" --principal-name "Principal" --principal-email "principal@myschool.com" --principal-password "StrongPass123!"
```

## Notes on database compatibility

The project currently has a schema/migration mismatch around the `UserRole` enum because older migrations only contained some values.

The OCS script includes a compatibility step that adds missing enum values before inserting the principal account.

For long-term stability, the database migrations should be updated so the live database matches the Prisma schema exactly.

## Summary

The current auth system provides:

- secure password hashing
- JWT access + refresh tokens
- role-based authorization
- DTO validation
- Swagger documentation
- an organization bootstrap script for tenant onboarding

This gives the system a complete foundation for authenticated multi-tenant school management workflows.
