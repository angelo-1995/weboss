-- Sprint 2: Cell Report Evolution + Team History & Multiplication
-- Strategy: ADDITIVE ONLY. No columns removed. No tables dropped.

-- ============================================================
-- 1. NEW ENUMS
-- ============================================================

CREATE TYPE "report_period_status" AS ENUM ('NORMAL', 'LATE');
CREATE TYPE "meeting_type" AS ENUM ('PRESENCIAL', 'VIRTUAL', 'HIBRIDA');
CREATE TYPE "team_history_event_type" AS ENUM ('CREATED', 'LEADER_CHANGED', 'CO_LEADER_CHANGED', 'COVERAGE_CHANGED', 'NETWORK_CHANGED', 'CODE_CHANGED', 'MULTIPLIED', 'INACTIVATED', 'REACTIVATED');

-- ============================================================
-- 2. CELL REPORT DRAFTS
-- Autosave support for report wizard (server-side)
-- ============================================================

CREATE TABLE "cell_report_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "form_data" JSONB NOT NULL,
    "current_step" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cell_report_drafts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cell_report_drafts_user_id_group_id_key" ON "cell_report_drafts"("user_id", "group_id");

ALTER TABLE "cell_report_drafts" ADD CONSTRAINT "cell_report_drafts_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 3. REPORT PHOTOS
-- Evidence photos attached to cell reports (max 3 per report)
-- ============================================================

CREATE TABLE "report_photos" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_photos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "report_photos_report_id_idx" ON "report_photos"("report_id");

ALTER TABLE "report_photos" ADD CONSTRAINT "report_photos_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "cell_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 4. REPORT COMMENTS
-- Leadership feedback on submitted reports
-- ============================================================

CREATE TABLE "report_comments" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "report_comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "report_comments_report_id_idx" ON "report_comments"("report_id");

ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "cell_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "report_comments" ADD CONSTRAINT "report_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 5. TEAM HISTORY
-- Event log for tracking changes to groups/teams
-- ============================================================

CREATE TABLE "team_history" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "event_type" "team_history_event_type" NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "performed_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "team_history_group_id_created_at_idx" ON "team_history"("group_id", "created_at" DESC);

ALTER TABLE "team_history" ADD CONSTRAINT "team_history_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_history" ADD CONSTRAINT "team_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- 6. TEAM MULTIPLICATIONS
-- Formal record of team multiplication events
-- ============================================================

CREATE TABLE "team_multiplications" (
    "id" TEXT NOT NULL,
    "parent_group_id" TEXT NOT NULL,
    "new_group_id" TEXT NOT NULL,
    "multiplied_by" TEXT NOT NULL,
    "multiplied_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" VARCHAR(500),
    "persons_transferred" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "team_multiplications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "team_multiplications_parent_group_id_idx" ON "team_multiplications"("parent_group_id");
CREATE INDEX "team_multiplications_multiplied_at_idx" ON "team_multiplications"("multiplied_at");

ALTER TABLE "team_multiplications" ADD CONSTRAINT "team_multiplications_parent_group_id_fkey" FOREIGN KEY ("parent_group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_multiplications" ADD CONSTRAINT "team_multiplications_new_group_id_fkey" FOREIGN KEY ("new_group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "team_multiplications" ADD CONSTRAINT "team_multiplications_multiplied_by_fkey" FOREIGN KEY ("multiplied_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
