import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { seedDemoData } from './demo-data';
import { seedPipelineStages } from './pipeline-stages';
import { seedJpdveDemo } from './jpdve-demo';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const password = await argon2.hash('Admin1234!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // ── Campus ────────────────────────────────────────────────
  const campus = await prisma.campus.upsert({
    where: { slug: 'sede-central' },
    update: {},
    create: {
      name: 'Sede Central',
      slug: 'sede-central',
      description: 'Campus principal',
      address: 'Av. Principal 123',
    },
  });
  console.log('✓ Campus:', campus.name);

  // ── Super Admin ───────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@community-os.local' },
    update: {},
    create: {
      email: 'admin@community-os.local',
      password,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN'],
      campusId: campus.id,
      profile: { create: { bio: 'Administrador del sistema' } },
    },
  });
  console.log('✓ Super Admin:', superAdmin.email);

  // ── Leader ────────────────────────────────────────────────
  const leader = await prisma.user.upsert({
    where: { email: 'lider@community-os.local' },
    update: {},
    create: {
      email: 'lider@community-os.local',
      password,
      firstName: 'María',
      lastName: 'González',
      status: 'ACTIVE',
      roles: ['LEADER'],
      campusId: campus.id,
      profile: { create: {} },
    },
  });
  console.log('✓ Leader:', leader.email);

  // ── Members ───────────────────────────────────────────────
  const memberEmails = [
    { email: 'juan@community-os.local', firstName: 'Juan', lastName: 'Pérez' },
    { email: 'ana@community-os.local', firstName: 'Ana', lastName: 'Martínez' },
    { email: 'carlos@community-os.local', firstName: 'Carlos', lastName: 'López' },
    { email: 'sofia@community-os.local', firstName: 'Sofía', lastName: 'Rodríguez' },
  ];

  const members = await Promise.all(
    memberEmails.map((m) =>
      prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: {
          ...m,
          password,
          status: 'ACTIVE',
          roles: ['MEMBER'],
          campusId: campus.id,
          profile: { create: {} },
        },
      }),
    ),
  );
  console.log(`✓ Members: ${members.length} created`);

  // ── Ministry ──────────────────────────────────────────────
  const ministry = await prisma.ministry.upsert({
    where: { slug: 'jovenes' },
    update: {},
    create: {
      name: 'Ministerio de Jóvenes',
      slug: 'jovenes',
      campusId: campus.id,
    },
  });
  console.log('✓ Ministry:', ministry.name);

  // ── Groups ────────────────────────────────────────────────
  const group1 = await prisma.group.upsert({
    where: { slug: 'celula-norte' },
    update: {},
    create: {
      name: 'Célula Norte',
      slug: 'celula-norte',
      type: 'CELL',
      campusId: campus.id,
      ministryId: ministry.id,
      createdById: leader.id,
    },
  });

  const group2 = await prisma.group.upsert({
    where: { slug: 'celula-sur' },
    update: {},
    create: {
      name: 'Célula Sur',
      slug: 'celula-sur',
      type: 'CELL',
      campusId: campus.id,
      ministryId: ministry.id,
      createdById: leader.id,
    },
  });
  console.log('✓ Groups: Célula Norte, Célula Sur');

  // ── Group Members ─────────────────────────────────────────
  await prisma.groupMember.upsert({
    where: { groupId_userId: { groupId: group1.id, userId: leader.id } },
    update: {},
    create: { groupId: group1.id, userId: leader.id, role: 'LEADER' },
  });

  for (const member of members.slice(0, 2)) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group1.id, userId: member.id } },
      update: {},
      create: { groupId: group1.id, userId: member.id, role: 'MEMBER' },
    });
  }

  for (const member of members.slice(2)) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group2.id, userId: member.id } },
      update: {},
      create: { groupId: group2.id, userId: member.id, role: 'MEMBER' },
    });
  }
  console.log('✓ Group members assigned');

  // ── Memberships ───────────────────────────────────────────
  for (const member of members) {
    await prisma.membership.create({
      data: {
        userId: member.id,
        groupId: group1.id,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    }).catch(() => {}); // ignore duplicates
  }
  console.log('✓ Memberships created');

  // ── Discipleship ──────────────────────────────────────────
  for (const member of members.slice(0, 2)) {
    await prisma.discipleshipRelationship.upsert({
      where: {
        mentorId_discipleId_type: {
          mentorId: leader.id,
          discipleId: member.id,
          type: 'MENTOR_MENTEE',
        },
      },
      update: {},
      create: {
        mentorId: leader.id,
        discipleId: member.id,
        type: 'MENTOR_MENTEE',
        status: 'ACTIVE',
        createdById: leader.id,
        groupId: group1.id,
      },
    });
  }
  console.log('✓ Discipleship relationships created');

  // ── Networks ──────────────────────────────────────────────
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
  console.log(`✓ Networks: ${networkSeeds.length} created`);

  // ── Permissions (Granular RBAC) ─────────────────────────
  const resources = ['users', 'groups', 'memberships', 'discipleship', 'reports', 'audit', 'permissions', 'campuses', 'ministries'];
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE'] as const;

  const permissions: Array<{ resource: string; action: string; name: string }> = [];
  for (const resource of resources) {
    for (const action of actions) {
      permissions.push({
        resource,
        action,
        name: `${resource}:${action.toLowerCase()}`,
      });
    }
  }

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: {
        resource: perm.resource,
        action: perm.action as never,
        name: perm.name,
        description: `${perm.action} access to ${perm.resource}`,
      },
    });
  }
  console.log(`✓ Permissions: ${permissions.length} created`);

  // ── Role-Permission Mappings ──────────────────────────────
  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map((p) => [p.name, p.id]));

  // SUPER_ADMIN gets MANAGE on everything
  const superAdminPerms = allPerms.filter((p) => p.action === 'MANAGE');
  for (const perm of superAdminPerms) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role: 'SUPER_ADMIN', permissionId: perm.id } },
      update: {},
      create: { role: 'SUPER_ADMIN', permissionId: perm.id },
    });
  }

  // ADMIN gets CREATE, READ, UPDATE, DELETE on most resources
  const adminResources = ['users', 'groups', 'memberships', 'discipleship', 'reports', 'campuses', 'ministries'];
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

  // MEMBER gets READ on most things
  const memberReadResources = ['users', 'groups', 'memberships', 'discipleship'];
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

  console.log('✓ Role-Permission mappings created');

  console.log('\n✅ Base seed complete!');
  console.log('─────────────────────────────────────');
  console.log('Credentials (all use password: Admin1234!)');
  console.log('  Super Admin: admin@community-os.local');
  console.log('  Leader:      lider@community-os.local');
  console.log('  Member:      juan@community-os.local');
  console.log('─────────────────────────────────────');

  // ── Demo Data ───────────────────────────────────────────
  await seedDemoData();

  // ── Pipeline Stages (J-PDVE Conexiones) ─────────────────
  await seedPipelineStages();

  // ── J-PDVE Demo Data (Product Owner Review) ─────────────
  await seedJpdveDemo();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ALL DEMO CREDENTIALS');
  console.log('═══════════════════════════════════════════════════');
  console.log('  Base (password: Admin1234!)');
  console.log('    admin@community-os.local');
  console.log('    lider@community-os.local');
  console.log('');
  console.log('  Demo (password: Demo1234!)');
  console.log('    pastor@demo.community-os.local    (SUPER_ADMIN)');
  console.log('    ruben@demo.community-os.local     (ADMIN - Red Caballeros)');
  console.log('    enelsa@demo.community-os.local    (ADMIN - Red Damas)');
  console.log('    marcos@demo.community-os.local    (LEADER - Célula A1)');
  console.log('    angelo@demo.community-os.local    (LEADER - Célula J1)');
  console.log('    member1@demo.community-os.local   (MEMBER)');
  console.log('═══════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
