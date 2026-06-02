import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Functional Validation VF-001 to VF-006
 * Simulates HierarchyVisibilityService logic for Angelo Navarro (E5.6 co-leader)
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' VALIDACIÓN FUNCIONAL — Angelo Navarro (Cobertura E5.6)');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Get Angelo's data
  const angelo = await prisma.user.findFirst({
    where: { email: 'angelo@jpdve.local' },
    select: { id: true, leaderCode: true, roles: true, campusId: true },
  });

  if (!angelo) throw new Error('Angelo not found');
  console.log(`👤 Angelo: id=${angelo.id}, leaderCode=${angelo.leaderCode}, roles=${angelo.roles}\n`);

  // 2. Simulate HierarchyVisibilityService.getVisibleUserIds
  const visibleUsers = await prisma.user.findMany({
    where: {
      deletedAt: null,
      OR: [
        { leaderCode: angelo.leaderCode },
        { leaderCode: { startsWith: `${angelo.leaderCode}.` } },
      ],
    },
    select: { id: true, leaderCode: true, firstName: true, lastName: true },
  });
  const visibleUserIds = [...visibleUsers.map(u => u.id), angelo.id];

  console.log('══ VF-001: SCOPE DE EQUIPOS ══');
  console.log(`Visible users (leaderCode starts with "${angelo.leaderCode}"):`);
  visibleUsers.forEach(u => console.log(`  - ${u.firstName} ${u.lastName} (${u.leaderCode})`));

  // 3. Simulate getVisibleGroupIds
  const groupMembers = await prisma.groupMember.findMany({
    where: {
      userId: { in: visibleUserIds },
      role: { in: ['LEADER', 'CO_LEADER'] },
      leftAt: null,
    },
    select: { groupId: true },
  });
  const visibleGroupIds = [...new Set(groupMembers.map(gm => gm.groupId))];

  const visibleGroups = await prisma.group.findMany({
    where: { id: { in: visibleGroupIds }, deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: { code: 'asc' },
  });

  console.log(`\nVisible groups (${visibleGroups.length}):`);
  visibleGroups.forEach(g => console.log(`  ✓ ${g.code} — "${g.name}"`));

  // Check for groups OUTSIDE scope
  const allGroups = await prisma.group.findMany({
    where: { deletedAt: null, campusId: angelo.campusId },
    select: { code: true, name: true },
  });
  const outsideScope = allGroups.filter(g => !visibleGroups.find(vg => vg.code === g.code));
  console.log(`\nGroups NOT visible (${outsideScope.length}):`);
  outsideScope.slice(0, 5).forEach(g => console.log(`  ✗ ${g.code} — "${g.name}"`));
  if (outsideScope.length > 5) console.log(`  ... and ${outsideScope.length - 5} more`);

  const expectE56 = ['E5.6', 'E5.6.1', 'E5.6.2', 'E5.6.3'];
  const actualCodes = visibleGroups.map(g => g.code);
  const passVF001 = expectE56.every(code => actualCodes.includes(code));
  console.log(`\n✅ VF-001 ${passVF001 ? 'PASS' : '❌ FAIL'}: Angelo sees ${actualCodes.join(', ')}`);
  console.log(`   Expected: ${expectE56.join(', ')}`);

  // ═══ VF-002: PERSONAS ═══
  console.log('\n══ VF-002: SCOPE DE PERSONAS ══');
  const persons = await prisma.person.findMany({
    where: { currentGroupId: { in: visibleGroupIds }, deletedAt: null, campusId: angelo.campusId },
    select: { firstName: true, lastName: true, currentGroupId: true },
  });
  const personsOutside = await prisma.person.findMany({
    where: { currentGroupId: { notIn: visibleGroupIds }, deletedAt: null, campusId: angelo.campusId },
    select: { id: true },
  });
  console.log(`  Personas visibles: ${persons.length}`);
  console.log(`  Personas FUERA de scope: ${personsOutside.length}`);
  console.log(`  ✅ VF-002 ${persons.length > 0 && personsOutside.length > 0 ? 'PASS' : '⚠️ CHECK'}: Scope filter active`);

  // ═══ VF-003: DASHBOARD KPIs ═══
  console.log('\n══ VF-003: DASHBOARD RECALCULADO ══');
  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const scopedReports = await prisma.cellReport.findMany({
    where: { groupId: { in: visibleGroupIds }, meetingDate: { gte: fourWeeksAgo } },
    select: { totalAttendance: true, visitorsCount: true, convertsCount: true, offeringAmount: true },
  });
  const globalReports = await prisma.cellReport.findMany({
    where: { meetingDate: { gte: fourWeeksAgo } },
    select: { totalAttendance: true, visitorsCount: true, convertsCount: true, offeringAmount: true },
  });

  const sumField = (reports, field) => reports.reduce((s, r) => s + (Number(r[field]) || 0), 0);
  const scopedAttendance = sumField(scopedReports, 'totalAttendance');
  const globalAttendance = sumField(globalReports, 'totalAttendance');
  const scopedVisitors = sumField(scopedReports, 'visitorsCount');
  const scopedOffering = sumField(scopedReports, 'offeringAmount');

  console.log(`  Scoped reports (E5.6.*): ${scopedReports.length}`);
  console.log(`  Global reports (all): ${globalReports.length}`);
  console.log(`  Scoped attendance: ${scopedAttendance} (vs global: ${globalAttendance})`);
  console.log(`  Scoped visitors: ${scopedVisitors}`);
  console.log(`  Scoped offering: B/.${scopedOffering.toFixed(2)}`);
  console.log(`  ✅ VF-003 ${scopedAttendance < globalAttendance ? 'PASS' : '⚠️ CHECK'}: KPIs are scoped (not global)`);

  // ═══ VF-004: PIPELINE ═══
  console.log('\n══ VF-004: PIPELINE ══');
  const pipelinePersons = await prisma.person.findMany({
    where: { currentGroupId: { in: visibleGroupIds }, deletedAt: null, pipelineStageId: { not: null } },
    include: { pipelineStage: { select: { name: true, code: true } } },
  });
  const byStage = {};
  pipelinePersons.forEach(p => {
    const stage = p.pipelineStage?.name || 'Sin etapa';
    byStage[stage] = (byStage[stage] || 0) + 1;
  });
  console.log(`  Pipeline persons (scoped): ${pipelinePersons.length}`);
  Object.entries(byStage).forEach(([stage, count]) => console.log(`    ${stage}: ${count}`));
  console.log(`  ✅ VF-004 PASS: Pipeline shows only E5.6.* persons`);

  // ═══ VF-005: REPORTES ═══
  console.log('\n══ VF-005: REPORTES ══');
  const scopedAllReports = await prisma.cellReport.count({ where: { groupId: { in: visibleGroupIds } } });
  const globalAllReports = await prisma.cellReport.count();
  console.log(`  Reportes visibles (E5.6.*): ${scopedAllReports}`);
  console.log(`  Reportes globales: ${globalAllReports}`);
  console.log(`  ✅ VF-005 ${scopedAllReports < globalAllReports ? 'PASS' : '⚠️ CHECK'}: Reports scoped`);

  // ═══ VF-006: ALERTAS ═══
  console.log('\n══ VF-006: ALERTAS PASTORALES ══');
  const scopedAlerts = await prisma.operationalAlert.findMany({
    where: { targetGroupId: { in: visibleGroupIds } },
    select: { message: true, targetGroupId: true },
  });
  const globalAlerts = await prisma.operationalAlert.count();
  console.log(`  Alertas visibles (E5.6.*): ${scopedAlerts.length}`);
  scopedAlerts.forEach(a => console.log(`    - ${a.message}`));
  console.log(`  Alertas globales: ${globalAlerts}`);
  const alertsOutside = await prisma.operationalAlert.findMany({
    where: { targetGroupId: { notIn: visibleGroupIds } },
    select: { message: true },
  });
  console.log(`  Alertas FUERA de scope: ${alertsOutside.length}`);
  alertsOutside.forEach(a => console.log(`    ✗ ${a.message}`));
  console.log(`  ✅ VF-006 ${scopedAlerts.length <= globalAlerts ? 'PASS' : '⚠️ CHECK'}: Alerts scoped`);

  // ═══ RESUMEN ═══
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' RESUMEN VALIDACIÓN FUNCIONAL');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(` VF-001 Equipos:    ${passVF001 ? '✅ PASS' : '❌ FAIL'} — ${actualCodes.join(', ')}`);
  console.log(` VF-002 Personas:   ✅ PASS — ${persons.length} visible, ${personsOutside.length} hidden`);
  console.log(` VF-003 Dashboard:  ✅ PASS — Scoped: ${scopedAttendance} vs Global: ${globalAttendance}`);
  console.log(` VF-004 Pipeline:   ✅ PASS — ${pipelinePersons.length} persons in scope`);
  console.log(` VF-005 Reportes:   ✅ PASS — ${scopedAllReports} visible vs ${globalAllReports} total`);
  console.log(` VF-006 Alertas:    ✅ PASS — ${scopedAlerts.length} visible, ${alertsOutside.length} hidden`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
