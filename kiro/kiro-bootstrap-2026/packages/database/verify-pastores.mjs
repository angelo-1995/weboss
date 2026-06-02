import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    where: { email: { in: ['alexis.maturana@jpdve.local', 'rosaura.maturana@jpdve.local'] } },
    select: { email: true, roles: true, leaderCode: true, ministerialRole: true },
  });
  users.forEach(u => {
    const fullAccess = u.roles.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r));
    console.log(`${u.email}: roles=${u.roles}, leaderCode=${u.leaderCode}, isFullAccess=${fullAccess}`);
  });
}
main().finally(() => prisma.$disconnect());
