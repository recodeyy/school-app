-- CreateTable: ai_usage_logs (tenant schema)
CREATE TABLE IF NOT EXISTS "tenant"."ai_usage_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(30) NOT NULL,
    "prompt_tokens" INTEGER NOT NULL,
    "completion_tokens" INTEGER NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ai_credit_allocations (tenant schema)
CREATE TABLE IF NOT EXISTS "tenant"."ai_credit_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role" "public"."UserRole" NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "daily_limit" INTEGER NOT NULL,
    "monthly_limit" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ai_credit_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ai_usage_logs_user_id_module_idx" ON "tenant"."ai_usage_logs"("user_id", "module");
CREATE INDEX IF NOT EXISTS "ai_usage_logs_created_at_idx" ON "tenant"."ai_usage_logs"("created_at");

-- CreateIndex (unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS "ai_credit_allocations_role_module_key" ON "tenant"."ai_credit_allocations"("role", "module");

-- AddForeignKey
ALTER TABLE "tenant"."ai_usage_logs"
    ADD CONSTRAINT "ai_usage_logs_user_id_fkey"
    FOREIGN KEY ("user_id")
    REFERENCES "tenant"."users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
