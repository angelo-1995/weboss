import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const users = await p.user.findMany({ where: { email: { contains: 'jpdve' } }, select: { email: true, status: true } });
console.log('JPDVE users found:', users.length);
console.log(JSON.stringify(users, null, 2));
await p.$disconnect();
