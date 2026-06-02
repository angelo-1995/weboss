-- Sprint 1: Person Entity + Pipeline Configurable + Church Evolution
-- Strategy: ADDITIVE ONLY. No columns removed. No tables dropped. No enums deleted.

-- ============================================================
-- 1. CHURCH EVOLUTION (ADR-003)
-- Add timezone, settings, church_code to existing campuses table
-- ============================================================

ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Panama';
ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "campuses" ADD COLUMN IF NOT EXISTS "church_code" VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS "campuses_church_code_key" ON "campuses"("church_code");

-- ============================================================
-- 2. PIPELINE CONFIGURABLE (ADR-004)
-- Create pipeline_stage_configs table
-- ============================================================

CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE');

CREATE TABLE "pipeline_stage_configs" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "order_index" SMALLINT NOT NULL,
    "color" VARCHAR(7),
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pipeline_stage_configs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pipeline_stage_configs_campus_id_code_key" ON "pipeline_stage_configs"("campus_id", "code");
CREATE INDEX "pipeline_stage_configs_campus_id_order_index_idx" ON "pipeline_stage_configs"("campus_id", "order_index");

ALTER TABLE "pipeline_stage_configs" ADD CONSTRAINT "pipeline_stage_configs_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 3. PERSON ENTITY (ADR-001)
-- Create persons table — independent of users
-- ============================================================

CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "birth_date" DATE,
    "gender" "gender",
    "address" VARCHAR(500),
    "avatar_url" VARCHAR(500),
    "pipeline_stage_id" TEXT,
    "current_group_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "persons_campus_id_idx" ON "persons"("campus_id");
CREATE INDEX "persons_current_group_id_idx" ON "persons"("current_group_id");
CREATE INDEX "persons_pipeline_stage_id_idx" ON "persons"("pipeline_stage_id");
CREATE INDEX "persons_campus_id_first_name_last_name_idx" ON "persons"("campus_id", "first_name", "last_name");

ALTER TABLE "persons" ADD CONSTRAINT "persons_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "persons" ADD CONSTRAINT "persons_pipeline_stage_id_fkey" FOREIGN KEY ("pipeline_stage_id") REFERENCES "pipeline_stage_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "persons" ADD CONSTRAINT "persons_current_group_id_fkey" FOREIGN KEY ("current_group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- 4. PERSON TEAM HISTORY
-- Track person assignments to groups over time
-- ============================================================

CREATE TABLE "person_team_history" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMPTZ(6),
    "reason" VARCHAR(200),
    "assigned_by" TEXT,

    CONSTRAINT "person_team_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "person_team_history_person_id_idx" ON "person_team_history"("person_id");
CREATE INDEX "person_team_history_group_id_idx" ON "person_team_history"("group_id");

ALTER TABLE "person_team_history" ADD CONSTRAINT "person_team_history_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "person_team_history" ADD CONSTRAINT "person_team_history_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 5. PERSON PIPELINE HISTORY (ADR-004)
-- Track all pipeline stage transitions for timeline + analytics
-- ============================================================

CREATE TABLE "person_pipeline_history" (
    "id" TEXT NOT NULL,
    "person_id" TEXT NOT NULL,
    "from_stage_id" TEXT,
    "to_stage_id" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" VARCHAR(500),
    "campus_id" TEXT NOT NULL,

    CONSTRAINT "person_pipeline_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "person_pipeline_history_person_id_changed_at_idx" ON "person_pipeline_history"("person_id", "changed_at" DESC);
CREATE INDEX "person_pipeline_history_campus_id_changed_at_idx" ON "person_pipeline_history"("campus_id", "changed_at");
CREATE INDEX "person_pipeline_history_to_stage_id_changed_at_idx" ON "person_pipeline_history"("to_stage_id", "changed_at");

ALTER TABLE "person_pipeline_history" ADD CONSTRAINT "person_pipeline_history_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "persons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "person_pipeline_history" ADD CONSTRAINT "person_pipeline_history_from_stage_id_fkey" FOREIGN KEY ("from_stage_id") REFERENCES "pipeline_stage_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "person_pipeline_history" ADD CONSTRAINT "person_pipeline_history_to_stage_id_fkey" FOREIGN KEY ("to_stage_id") REFERENCES "pipeline_stage_configs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 6. SEED DEFAULT PIPELINE STAGES
-- These are the J-PDVE Conexiones default stages.
-- campus_id will be set after first campus is identified.
-- ============================================================

-- Note: Seed data should be inserted via the seed script, not migration.
-- This ensures it uses the correct campus_id dynamically.
