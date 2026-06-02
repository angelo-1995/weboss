-- AlterTable
ALTER TABLE "persons" ADD COLUMN "owner_leader_id" UUID;

-- CreateIndex
CREATE INDEX "persons_owner_leader_id_idx" ON "persons"("owner_leader_id");

-- AddForeignKey
ALTER TABLE "persons" ADD CONSTRAINT "persons_owner_leader_id_fkey" FOREIGN KEY ("owner_leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
