/**
 * PRODUCTION SEED
 *
 * Creates ONLY the structural data needed for the platform to function:
 * - Permissions (RBAC)
 * - Role-Permission mappings
 * - Networks (organizational structure)
 * - First SUPER_ADMIN user
 *
 * Does NOT create: demo users, fake groups, test data.
 *
 * Usage:
 *   ADMIN_EMAIL=pastor@tuiglesia.com ADMIN_PASSWORD=TuContraseñaSegura123! npx ts-node src/seed/production.ts
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Production seed starting...\n');

  // ── Validate required env vars ────────────────────────────
  const adminEmail = process.env['ADMIN_EMAIL'];
  const adminPassword = process.env['ADMIN_PASSWORD'];
  const adminFirstName = process.env['ADMIN_FIRST_NAME'] || 'Admin';
  const adminLastName = process.env['ADMIN_LAST_NAME'] || 'Principal';

  if (!adminEmail || !adminPassword) {
    console.error('❌ ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    console.error('');
    console.error('Usage:');
    console.error('  ADMIN_EMAIL=pastor@tuiglesia.com ADMIN_PASSWORD=SecurePass123! npx ts-node src/seed/production.ts');
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('❌ ERROR: ADMIN_PASSWORD must be at least 8 characters.');
    process.exit(1);
  }

  // ── 1. Permissions ────────────────────────────────────────
  console.log('📋 Creating permissions...');

  const resources = [
    'users', 'groups', 'memberships', 'discipleship',
    'reports', 'audit', 'permissions', 'campuses',
    'ministries', 'sermons', 'networks', 'invitations',
  ];
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'] as const;

  let permCount = 0;
  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { name: `${resource}:${action.toLowerCase()}` },
        update: {},
        create: {
          resource,
          action: action as never,
          name: `${resource}:${action.toLowerCase()}`,
          description: `${action} access to ${resource}`,
        },
      });
      permCount++;
    }
  }
  console.log(`  ✓ ${permCount} permissions created`);

  // ── 2. Role-Permission Mappings ───────────────────────────
  console.log('🔐 Creating role-permission mappings...');

  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map((p) => [p.name, p.id]));

  // SUPER_ADMIN → MANAGE everything
  const managePerms = allPerms.filter((p) => p.action === 'MANAGE');
  for (const perm of managePerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'SUPER_ADMIN', permissionId: perm.id } },
      update: {},
      create: { role: 'SUPER_ADMIN', permissionId: perm.id },
    });
  }

  // ADMIN → CRUD on operational resources
  const adminResources = ['users', 'groups', 'memberships', 'discipleship', 'reports', 'campuses', 'ministries', 'sermons', 'networks', 'invitations'];
  for (const resource of adminResources) {
    for (const action of ['CREATE', 'READ', 'UPDATE', 'DELETE']) {
      const permId = permMap.get(`${resource}:${action.toLowerCase()}`);
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { role_permissionId: { role: 'ADMIN', permissionId: permId } },
          update: {},
          create: { role: 'ADMIN', permissionId: permId },
        });
      }
    }
  }
  // ADMIN can read audit
  const auditReadId = permMap.get('audit:read');
  if (auditReadId) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'ADMIN', permissionId: auditReadId } },
      update: {},
      create: { role: 'ADMIN', permissionId: auditReadId },
    });
  }

  // LEADER → READ most + CREATE reports
  const leaderReadResources = ['users', 'groups', 'memberships', 'discipleship', 'sermons'];
  for (const resource of leaderReadResources) {
    const permId = permMap.get(`${resource}:read`);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: 'LEADER', permissionId: permId } },
        update: {},
        create: { role: 'LEADER', permissionId: permId },
      });
    }
  }
  const reportsCreateId = permMap.get('reports:create');
  if (reportsCreateId) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'LEADER', permissionId: reportsCreateId } },
      update: {},
      create: { role: 'LEADER', permissionId: reportsCreateId },
    });
  }

  // MEMBER → READ basic resources
  const memberReadResources = ['users', 'groups', 'memberships', 'discipleship', 'sermons'];
  for (const resource of memberReadResources) {
    const permId = permMap.get(`${resource}:read`);
    if (permId) {
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: 'MEMBER', permissionId: permId } },
        update: {},
        create: { role: 'MEMBER', permissionId: permId },
      });
    }
  }

  console.log('  ✓ Role-permission mappings created (SUPER_ADMIN, ADMIN, LEADER, MEMBER)');

  // ── 3. Networks ───────────────────────────────────────────
  console.log('🌐 Creating networks...');

  const networkSeeds = [
    { code: 'CAB', name: 'Red de Caballeros' },
    { code: 'DAM', name: 'Red de Damas' },
    { code: 'JOV', name: 'Red de Jóvenes' },
    { code: 'JOC', name: 'Red de Jovencitas' },
    { code: 'MAT', name: 'Red de Matrimonios' },
    { code: 'NIN', name: 'Red de Niños' },
  ];

  for (const net of networkSeeds) {
    await prisma.network.upsert({
      where: { code: net.code },
      update: {},
      create: { code: net.code, name: net.name },
    });
  }
  console.log(`  ✓ ${networkSeeds.length} networks created`);

  // ── 4. First SUPER_ADMIN user ─────────────────────────────
  console.log('👤 Creating admin user...');

  const hashedPassword = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      profile: { create: { bio: 'Administrador del sistema' } },
    },
  });
  console.log(`  ✓ Admin created: ${admin.email}`);

  // ── Done ──────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅ PRODUCTION SEED COMPLETE');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Admin email: ${adminEmail}`);
  console.log(`  Permissions: ${permCount}`);
  console.log(`  Networks: ${networkSeeds.length}`);
  console.log('');
  console.log('  Next steps:');
  console.log('  1. Login with your admin credentials');
  console.log('  2. Create a Campus');
  console.log('  3. Invite pastors and leaders');
  console.log('  4. Create groups and assign members');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Production seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
