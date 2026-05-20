-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "meeting_date" TIMESTAMP(3) NOT NULL,
    "attendance_count" INTEGER NOT NULL,
    "new_visitors_count" INTEGER NOT NULL DEFAULT 0,
    "prayer_requests" TEXT,
    "notes" TEXT,
    "offering_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_reports_group_id_idx" ON "weekly_reports"("group_id");

-- CreateIndex
CREATE INDEX "weekly_reports_reporter_id_idx" ON "weekly_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "weekly_reports_meeting_date_idx" ON "weekly_reports"("meeting_date");

-- CreateIndex
CREATE INDEX "weekly_reports_group_id_meeting_date_idx" ON "weekly_reports"("group_id", "meeting_date");

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
