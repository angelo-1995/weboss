import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Applying ADR-011 ownership migration to Neon...\n');

  // Add column (IF NOT EXISTS for idempotency)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "persons" ADD COLUMN IF NOT EXISTS "owner_leader_id" UUID`
  );
  console.log('✓ Column owner_leader_id added (or already exists)');

  // Fix type mismatch: users.id is TEXT, owner_leader_id was created as UUID
  // Change to TEXT to match the referenced column
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "persons" ALTER COLUMN "owner_leader_id" TYPE TEXT`
  );
  console.log('✓ Column type changed to TEXT (matches users.id)');

  // Drop and recreate index for the new type
  await prisma.$executeRawUnsafe(
    `DROP INDEX IF EXISTS "persons_owner_leader_id_idx"`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "persons_owner_leader_id_idx" ON "persons"("owner_leader_id")`
  );
  console.log('✓ Index persons_owner_leader_id_idx created');

  // Add FK (may fail if already exists, catch gracefully)
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "persons" ADD CONSTRAINT "persons_owner_leader_id_fkey" FOREIGN KEY ("owner_leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`
    );
    console.log('✓ Foreign key persons_owner_leader_id_fkey added');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('✓ Foreign key already exists (idempotent)');
    } else {
      throw e;
    }
  }

  // Verify current state
  const totalPersons = await prisma.person.count({ where: { deletedAt: null } });
  const withOwner = await prisma.person.count({
    where: { deletedAt: null, ownerLeaderId: { not: null } },
  });
  const withGroup = await prisma.person.count({
    where: { deletedAt: null, currentGroupId: { not: null } },
  });

  console.log('\n📊 Current state:');
  console.log(`   Total persons (active): ${totalPersons}`);
  console.log(`   With ownerLeaderId:     ${withOwner}`);
  console.log(`   With currentGroupId:    ${withGroup}`);
  console.log(`   Without owner:          ${totalPersons - withOwner}`);
  console.log('\n✅ Migration complete.');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
