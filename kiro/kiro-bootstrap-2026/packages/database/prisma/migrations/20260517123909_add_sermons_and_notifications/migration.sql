-- CreateEnum
CREATE TYPE "sermon_status" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "sermons" (
    "id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "sermon_date" TIMESTAMP(3) NOT NULL,
    "cover_image_url" TEXT,
    "video_url" TEXT,
    "external_link" TEXT,
    "status" "sermon_status" NOT NULL DEFAULT 'DRAFT',
    "publish_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sermons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_files" (
    "id" TEXT NOT NULL,
    "sermon_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sermon_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sermon_views" (
    "id" TEXT NOT NULL,
    "sermon_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sermon_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sermon_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sermons_network_id_status_idx" ON "sermons"("network_id", "status");

-- CreateIndex
CREATE INDEX "sermons_status_publish_at_idx" ON "sermons"("status", "publish_at");

-- CreateIndex
CREATE INDEX "sermons_network_id_sermon_date_idx" ON "sermons"("network_id", "sermon_date");

-- CreateIndex
CREATE INDEX "sermon_files_sermon_id_idx" ON "sermon_files"("sermon_id");

-- CreateIndex
CREATE UNIQUE INDEX "sermon_views_sermon_id_user_id_key" ON "sermon_views"("sermon_id", "user_id");

-- CreateIndex
CREATE INDEX "sermon_views_sermon_id_idx" ON "sermon_views"("sermon_id");

-- CreateIndex
CREATE INDEX "sermon_views_user_id_idx" ON "sermon_views"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_files" ADD CONSTRAINT "sermon_files_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_views" ADD CONSTRAINT "sermon_views_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sermons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sermon_views" ADD CONSTRAINT "sermon_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sermon_id_fkey" FOREIGN KEY ("sermon_id") REFERENCES "sermons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
