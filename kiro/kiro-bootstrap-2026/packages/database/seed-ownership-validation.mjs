import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ownership validation dataset (ADR-011)...\n');

  // 1. Find key users
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@jpdve.local', deletedAt: null },
    select: { id: true, email: true, roles: true },
  });
  const oris = await prisma.user.findFirst({
    where: { email: 'oris@jpdve.local', deletedAt: null },
    select: { id: true, email: true, roles: true },
  });
  const keisly = await prisma.user.findFirst({
    where: { email: 'keisly@jpdve.local', deletedAt: null },
    select: { id: true, email: true, roles: true },
  });
  const daniela = await prisma.user.findFirst({
    where: { email: 'daniela.g@jpdve.local', deletedAt: null },
    select: { id: true, email: true, roles: true },
  });

  console.log('👤 Users found:');
  console.log(`   admin:   ${admin ? admin.id : '❌ NOT FOUND'}`);
  console.log(`   oris:    ${oris ? oris.id : '❌ NOT FOUND'}`);
  console.log(`   keisly:  ${keisly ? keisly.id : '❌ NOT FOUND'}`);
  console.log(`   daniela: ${daniela ? daniela.id : '❌ NOT FOUND'}`);

  if (!keisly || !daniela) {
    console.error('\n❌ Cannot proceed: keisly and/or daniela not found in DB.');
    process.exit(1);
  }

  // 2. Find groups E5.1 and E5.2
  const groupE51 = await prisma.group.findFirst({
    where: { code: 'E5.1', deletedAt: null },
    select: { id: true, name: true, code: true },
  });
  const groupE52 = await prisma.group.findFirst({
    where: { code: 'E5.2', deletedAt: null },
    select: { id: true, name: true, code: true },
  });

  console.log('\n📂 Groups found:');
  console.log(`   E5.1: ${groupE51 ? `${groupE51.id} (${groupE51.name})` : '❌ NOT FOUND'}`);
  console.log(`   E5.2: ${groupE52 ? `${groupE52.id} (${groupE52.name})` : '❌ NOT FOUND'}`);

  if (!groupE51 || !groupE52) {
    console.error('\n❌ Cannot proceed: groups E5.1 and/or E5.2 not found in DB.');
    process.exit(1);
  }

  // 3. Find persons in E5.1 (take 3)
  const personsE51 = await prisma.person.findMany({
    where: { currentGroupId: groupE51.id, deletedAt: null },
    take: 3,
    select: { id: true, firstName: true, lastName: true },
  });

  // 4. Find persons in E5.2 (take 3)
  const personsE52 = await prisma.person.findMany({
    where: { currentGroupId: groupE52.id, deletedAt: null },
    take: 3,
    select: { id: true, firstName: true, lastName: true },
  });

  console.log(`\n👥 Persons in E5.1: ${personsE51.length} found (need 3)`);
  personsE51.forEach((p) => console.log(`   - ${p.firstName} ${p.lastName} (${p.id})`));

  console.log(`👥 Persons in E5.2: ${personsE52.length} found (need 3)`);
  personsE52.forEach((p) => console.log(`   - ${p.firstName} ${p.lastName} (${p.id})`));

  if (personsE51.length < 3 || personsE52.length < 3) {
    console.warn('\n⚠️  Not enough persons in groups. Assigning what we have...');
  }

  // 5. Update E5.1 persons → ownerLeaderId = keisly
  let updatedE51 = 0;
  for (const person of personsE51) {
    await prisma.person.update({
      where: { id: person.id },
      data: { ownerLeaderId: keisly.id },
    });
    updatedE51++;
  }
  console.log(`\n✓ Updated ${updatedE51} persons in E5.1 → ownerLeaderId = keisly (${keisly.id})`);

  // 6. Update E5.2 persons → ownerLeaderId = daniela
  let updatedE52 = 0;
  for (const person of personsE52) {
    await prisma.person.update({
      where: { id: person.id },
      data: { ownerLeaderId: daniela.id },
    });
    updatedE52++;
  }
  console.log(`✓ Updated ${updatedE52} persons in E5.2 → ownerLeaderId = daniela (${daniela.id})`);

  // 7. Summary
  const totalWithOwner = await prisma.person.count({
    where: { deletedAt: null, ownerLeaderId: { not: null } },
  });
  const totalPersons = await prisma.person.count({ where: { deletedAt: null } });

  console.log('\n📊 Summary:');
  console.log(`   Total active persons:   ${totalPersons}`);
  console.log(`   With ownerLeaderId:     ${totalWithOwner}`);
  console.log(`   Without ownerLeaderId:  ${totalPersons - totalWithOwner}`);
  console.log('\n✅ Seed validation complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
