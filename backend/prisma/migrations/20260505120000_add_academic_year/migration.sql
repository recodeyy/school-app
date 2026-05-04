-- Migration: add_academic_year
-- This migration creates the academic_years table in the fixed `tenant` schema,
-- which matches the current Prisma model declaration (`@@schema("tenant")`).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS "tenant";

CREATE TABLE IF NOT EXISTS "tenant"."academic_years" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR(50) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "academic_years_is_active_idx"
  ON "tenant"."academic_years" ("is_active");

CREATE INDEX IF NOT EXISTS "academic_years_start_date_idx"
  ON "tenant"."academic_years" ("start_date");

COMMIT;
