import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Check Augusto and Angelo
  const users = await prisma.user.findMany({
    where: { email: { in: ['augusto@jpdve.local', 'angelo@jpdve.local'] } },
    select: { id: true, email: true, firstName: true, lastName: true, leaderCode: true, leaderId: true, ministerialRole: true },
  });
  console.log('=== CO-LEADERS E5.6 ===');
  console.log(JSON.stringify(users, null, 2));

  // Check what groups they're LEADER/CO_LEADER of
  for (const u of users) {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: u.id, leftAt: null, role: { in: ['LEADER', 'CO_LEADER'] } },
      include: { group: { select: { id: true, name: true, code: true } } },
    });
    console.log(`\n${u.firstName} ${u.lastName} (${u.leaderCode}) leads:`);
    memberships.forEach(m => console.log(`  - ${m.group.code} "${m.group.name}" as ${m.role}`));
  }

  // Check group E5.6 and its children
  const e56 = await prisma.group.findFirst({ where: { code: 'E5.6' }, select: { id: true, name: true, code: true } });
  if (e56) {
    const children = await prisma.group.findMany({
      where: { parentId: e56.id, deletedAt: null },
      select: { id: true, name: true, code: true },
    });
    console.log(`\n=== E5.6 CHILDREN ===`);
    children.forEach(c => console.log(`  - ${c.code} "${c.name}"`));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
