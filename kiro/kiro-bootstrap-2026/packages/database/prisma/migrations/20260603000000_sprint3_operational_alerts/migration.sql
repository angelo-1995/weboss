-- Sprint 3: Operational Alerts
-- Auto-generated alerts for pastoral intelligence

CREATE TYPE "alert_type" AS ENUM ('MISSING_REPORT', 'DECLINING_ATTENDANCE', 'ZERO_VISITORS', 'STAGNANT_GROWTH', 'NO_FOLLOW_UP');

CREATE TABLE "operational_alerts" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "type" "alert_type" NOT NULL,
    "target_group_id" TEXT,
    "target_user_id" TEXT,
    "responsible_user_id" TEXT NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "metadata" JSONB,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMPTZ(6),
    "acknowledged_by" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operational_alerts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "operational_alerts_campus_id_type_acknowledged_idx" ON "operational_alerts"("campus_id", "type", "acknowledged");
CREATE INDEX "operational_alerts_target_group_id_idx" ON "operational_alerts"("target_group_id");
CREATE INDEX "operational_alerts_responsible_user_id_idx" ON "operational_alerts"("responsible_user_id");
CREATE INDEX "operational_alerts_created_at_idx" ON "operational_alerts"("created_at");

ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_target_group_id_fkey" FOREIGN KEY ("target_group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "operational_alerts" ADD CONSTRAINT "operational_alerts_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
