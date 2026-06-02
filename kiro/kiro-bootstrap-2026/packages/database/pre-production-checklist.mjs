import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' PRE-PRODUCTION CHECKLIST — J-PDVE Conexiones');
  console.log(' Fecha: ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════\n');

  // ══ PRE-001: SMTP ══
  console.log('══ PRE-001: SMTP CONFIG ══');
  // Check env vars for SMTP (we can't send email from here, but can verify config exists)
  const smtpHost = process.env.SMTP_HOST || '(not set)';
  const smtpPort = process.env.SMTP_PORT || '(not set)';
  console.log(`  SMTP_HOST: ${smtpHost}`);
  console.log(`  SMTP_PORT: ${smtpPort}`);
  console.log(`  SMTP_USER: ${process.env.SMTP_USER ? '✓ set' : '❌ NOT SET'}`);
  console.log(`  SMTP_PASS: ${process.env.SMTP_PASS ? '✓ set' : '❌ NOT SET'}`);
  console.log(`  ⚠️  PRE-001 REQUIRES MANUAL TEST: Send invitation from UI`);
  console.log(`  Action: Configure SMTP_USER and SMTP_PASS in Railway (Gmail App Password)\n`);

  // ══ PRE-007: DATA INTEGRITY ══
  console.log('══ PRE-007: DATOS PRODUCTIVOS — INTEGRIDAD ══\n');

  // 7.1: leaderCode uniqueness check
  const leaderCodes = await prisma.user.groupBy({
    by: ['leaderCode'],
    where: { deletedAt: null, leaderCode: { not: null } },
    _count: { leaderCode: true },
  });
  const duplicateCodes = leaderCodes.filter(lc => lc._count.leaderCode > 2);
  // Note: 2 is OK because leader + co-leader share the same code (ADR-012)
  const suspiciousCodes = leaderCodes.filter(lc => lc._count.leaderCode > 2);
  console.log('  7.1 LeaderCode Distribution:');
  console.log(`    Unique codes: ${leaderCodes.length}`);
  console.log(`    Codes with >2 users (suspicious): ${suspiciousCodes.length}`);
  if (suspiciousCodes.length > 0) {
    suspiciousCodes.forEach(s => console.log(`      ⚠️ "${s.leaderCode}" has ${s._count.leaderCode} users`));
  } else {
    console.log('    ✅ All codes have ≤2 users (leader + co-leader)');
  }

  // 7.2: ownerLeaderId consistency
  const personsWithOwner = await prisma.person.count({ where: { deletedAt: null, ownerLeaderId: { not: null } } });
  const personsWithoutOwner = await prisma.person.count({ where: { deletedAt: null, ownerLeaderId: null } });
  const personsTotal = personsWithOwner + personsWithoutOwner;
  console.log('\n  7.2 OwnerLeaderId:');
  console.log(`    With owner: ${personsWithOwner}`);
  console.log(`    Without owner (NULL): ${personsWithoutOwner}`);
  console.log(`    Total: ${personsTotal}`);
  console.log(`    ${personsWithoutOwner > 0 ? '⚠️ NULL owners exist (acceptable for MVP — see OWNERSHIP_RULES.md)' : '✅ All persons have owner'}`);

  // 7.3: currentGroupId validity
  const personsWithGroup = await prisma.person.count({ where: { deletedAt: null, currentGroupId: { not: null } } });
  const personsWithInvalidGroup = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM persons p 
    LEFT JOIN groups g ON p.current_group_id = g.id 
    WHERE p.deleted_at IS NULL 
    AND p.current_group_id IS NOT NULL 
    AND (g.id IS NULL OR g.deleted_at IS NOT NULL)
  `;
  console.log('\n  7.3 CurrentGroupId:');
  console.log(`    With group: ${personsWithGroup}`);
  console.log(`    Invalid/orphan group references: ${personsWithInvalidGroup[0]?.count || 0}`);
  console.log(`    ${Number(personsWithInvalidGroup[0]?.count || 0) === 0 ? '✅ All group references valid' : '❌ ORPHAN REFERENCES FOUND'}`);

  // 7.4: Orphan relationships
  const orphanGroupMembers = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM group_members gm
    LEFT JOIN users u ON gm.user_id = u.id
    WHERE u.id IS NULL OR u.deleted_at IS NOT NULL
  `;
  const orphanReports = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM cell_reports cr
    LEFT JOIN groups g ON cr.group_id = g.id
    WHERE g.id IS NULL OR g.deleted_at IS NOT NULL
  `;
  console.log('\n  7.4 Orphan Relationships:');
  console.log(`    Orphan group_members (user deleted): ${orphanGroupMembers[0]?.count || 0}`);
  console.log(`    Orphan cell_reports (group deleted): ${orphanReports[0]?.count || 0}`);
  const orphansOk = Number(orphanGroupMembers[0]?.count || 0) === 0 && Number(orphanReports[0]?.count || 0) === 0;
  console.log(`    ${orphansOk ? '✅ No orphan relationships' : '⚠️ Orphans found (non-blocking for pilot)'}`);

  // 7.5: Users with leaderCode but no group membership
  const usersNoGroup = await prisma.$queryRaw`
    SELECT u.email, u.leader_code FROM users u
    WHERE u.leader_code IS NOT NULL
    AND u.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.user_id = u.id 
      AND gm.left_at IS NULL
      AND gm.role IN ('LEADER', 'CO_LEADER')
    )
  `;
  console.log('\n  7.5 Leaders without group membership:');
  console.log(`    Count: ${usersNoGroup.length}`);
  if (usersNoGroup.length > 0) {
    usersNoGroup.slice(0, 5).forEach(u => console.log(`      ⚠️ ${u.email} (${u.leader_code})`));
  } else {
    console.log('    ✅ All leaders have active group membership');
  }

  // ══ PRE-006: PERFORMANCE ══
  console.log('\n══ PRE-006: PERFORMANCE ══');
  
  // Simulate dashboard query timing
  const startKpi = Date.now();
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const groups = await prisma.group.findMany({ where: { isActive: true, deletedAt: null, type: 'CELL' }, select: { id: true } });
  const groupIds = groups.map(g => g.id);
  await prisma.cellReport.findMany({
    where: { groupId: { in: groupIds }, meetingDate: { gte: fourWeeksAgo } },
    select: { totalAttendance: true, visitorsCount: true, offeringAmount: true },
  });
  const kpiTime = Date.now() - startKpi;

  const startPersons = Date.now();
  await prisma.person.findMany({
    where: { deletedAt: null },
    include: { pipelineStage: true, currentGroup: { select: { id: true, name: true, code: true } } },
    take: 50,
  });
  const personsTime = Date.now() - startPersons;

  const startGroups = Date.now();
  await prisma.group.findMany({
    where: { deletedAt: null },
    take: 50,
  });
  const groupsTime = Date.now() - startGroups;

  console.log(`  Dashboard KPIs query: ${kpiTime}ms ${kpiTime < 2000 ? '✅' : '❌ > 2s'}`);
  console.log(`  Persons list (50): ${personsTime}ms ${personsTime < 2000 ? '✅' : '❌ > 2s'}`);
  console.log(`  Groups list (50): ${groupsTime}ms ${groupsTime < 2000 ? '✅' : '❌ > 2s'}`);

  // ══ SUMMARY ══
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' RESUMEN PRE-PRODUCTION CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(` PRE-001 SMTP:        ⚠️ REQUIRES MANUAL CONFIG (SMTP_USER/SMTP_PASS in Railway)`);
  console.log(` PRE-002 Usuarios:    ⚠️ REQUIRES MANUAL E2E TEST (UI)`);
  console.log(` PRE-003 Reportes:    ⚠️ REQUIRES MANUAL E2E TEST (UI)`);
  console.log(` PRE-004 Pipeline:    ⚠️ REQUIRES MANUAL E2E TEST (UI)`);
  console.log(` PRE-005 Mobile:      ⚠️ REQUIRES MANUAL VISUAL REVIEW`);
  console.log(` PRE-006 Performance: ${kpiTime < 2000 && personsTime < 2000 ? '✅ PASS' : '❌ FAIL'} (KPIs: ${kpiTime}ms, Persons: ${personsTime}ms)`);
  console.log(` PRE-007 Integridad:  ${orphansOk && suspiciousCodes.length === 0 ? '✅ PASS' : '⚠️ WARNINGS'}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📋 ACCIONES MANUALES REQUERIDAS:');
  console.log('  1. Configurar SMTP_USER + SMTP_PASS en Railway (Gmail App Password)');
  console.log('  2. Enviar invitación real desde UI → verificar correo recibido');
  console.log('  3. Login con usuario invitado → verificar scope');
  console.log('  4. Crear reporte de célula como líder → verificar en dashboard');
  console.log('  5. Mover persona por pipeline → verificar historial');
  console.log('  6. Revisar todas las pantallas en móvil');
  console.log('');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
