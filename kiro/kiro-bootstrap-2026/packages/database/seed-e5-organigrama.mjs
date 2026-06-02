import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

/**
 * SEED: Organigrama E5 - Red de Jóvenes "Generación de Fe"
 * Datos reales del ministerio para demo y piloto.
 */
async function main() {
  console.log('🎯 Seeding Organigrama E5 - Generación de Fe...\n');

  const password = await argon2.hash('ChangeMe123!', { type: 2, memoryCost: 65536, timeCost: 3, parallelism: 4 });

  // ══════════════════════════════════════════════════
  // 1. CAMPUS
  // ══════════════════════════════════════════════════
  const campus = await prisma.campus.upsert({
    where: { slug: 'sede-central' },
    update: { name: 'Ministerio Palabras de Vida Eterna', timezone: 'America/Panama', churchCode: 'JPDVE' },
    create: { name: 'Ministerio Palabras de Vida Eterna', slug: 'sede-central', timezone: 'America/Panama', churchCode: 'JPDVE' },
  });

  // ══════════════════════════════════════════════════
  // 2. RED E5
  // ══════════════════════════════════════════════════
  const netE5 = await prisma.network.upsert({
    where: { code: 'E5' },
    update: { name: 'Red Naranja - Generación de Fe' },
    create: { code: 'E5', name: 'Red Naranja - Generación de Fe' },
  });

  // ══════════════════════════════════════════════════
  // 3. PIPELINE STAGES
  // ══════════════════════════════════════════════════
  const stageData = [
    { code: 'VISITANTE', name: 'Visitante', orderIndex: 1, color: '#9CA3AF' },
    { code: 'CONSOLIDADO', name: 'Consolidado', orderIndex: 2, color: '#60A5FA' },
    { code: 'ACADEMIA_N1', name: 'Academia Nivel 1', orderIndex: 3, color: '#34D399' },
    { code: 'ACADEMIA_N2', name: 'Academia Nivel 2', orderIndex: 4, color: '#10B981' },
    { code: 'ACADEMIA_N3', name: 'Academia Nivel 3', orderIndex: 5, color: '#059669' },
    { code: 'SERVIDOR', name: 'Servidor', orderIndex: 6, color: '#FBBF24' },
    { code: 'LIDER_POTENCIAL', name: 'Líder Potencial', orderIndex: 7, color: '#F97316' },
    { code: 'LIDER', name: 'Líder', orderIndex: 8, color: '#EF4444' },
    { code: 'COBERTURA', name: 'Cobertura', orderIndex: 9, color: '#8B5CF6' },
  ];
  const stages = {};
  for (const s of stageData) {
    const stage = await prisma.pipelineStageConfig.upsert({
      where: { campusId_code: { campusId: campus.id, code: s.code } },
      update: s,
      create: { ...s, campusId: campus.id },
    });
    stages[s.code] = stage.id;
  }
  console.log('✓ Pipeline Stages: 9');

  // ══════════════════════════════════════════════════
  // 4. USERS (Líderes del organigrama)
  // ══════════════════════════════════════════════════
  const users = {};

  async function createUser(email, firstName, lastName, role, ministerialRole, leaderCode, leaderId) {
    const u = await prisma.user.upsert({
      where: { email },
      update: { password },
      create: { email, password, firstName, lastName, status: 'ACTIVE', roles: [role], campusId: campus.id, networkId: netE5.id, ministerialRole, leaderCode, leaderId, profile: { create: {} } },
    });
    users[leaderCode] = u;
    return u;
  }

  // Pastor General
  await createUser('admin@jpdve.local', 'Pastor', 'General', 'SUPER_ADMIN', 'PASTOR_GENERAL', 'PG', null);

  // Liderazgo Principal E5
  const oris = await createUser('oris@jpdve.local', 'Oris', 'Alvarez', 'ADMIN', 'COBERTURA', 'E5', null);
  await createUser('luis.h@jpdve.local', 'Luis', 'Hernandez', 'ADMIN', 'COBERTURA', 'E5.co', oris.id);

  // Coberturas directas de E5
  await createUser('keisly@jpdve.local', 'Keisly', 'Galvez', 'LEADER', 'LIDER', 'E5.1', oris.id);
  await createUser('daniela.g@jpdve.local', 'Daniela', 'Guzmán', 'LEADER', 'LIDER', 'E5.2', oris.id);
  await createUser('milagro@jpdve.local', 'Milagro', 'Sánchez', 'LEADER', 'LIDER', 'E5.3', oris.id);
  const danielG = await createUser('daniel.g@jpdve.local', 'Daniel', 'Guzmán', 'LEADER', 'COBERTURA', 'E5.4', oris.id);
  await createUser('jair@jpdve.local', 'Jair', 'Corella', 'LEADER', 'LIDER', 'E5.5', oris.id);
  const augusto = await createUser('augusto@jpdve.local', 'Augusto', 'Monterrey', 'LEADER', 'COBERTURA', 'E5.6', oris.id);
  const diego = await createUser('diego.e@jpdve.local', 'Diego', 'Espinoza', 'LEADER', 'COBERTURA', 'E5.7', oris.id);
  await createUser('daphne@jpdve.local', 'Daphne', 'Camarena', 'LEADER', 'LIDER', 'E5.8', oris.id);

  // Líderes bajo E5.4 (Daniel Guzmán)
  await createUser('andres.p@jpdve.local', 'Andres', 'Peralta', 'LEADER', 'LIDER', 'E5.4.1', danielG.id);
  await createUser('jose.c@jpdve.local', 'Jose', 'Castellón', 'LEADER', 'LIDER', 'E5.4.2', danielG.id);
  await createUser('abraham@jpdve.local', 'Abraham', 'Montoya', 'LEADER', 'LIDER', 'E5.4.3', danielG.id);

  // Líderes bajo E5.6 (Augusto Monterrey)
  await createUser('jonatan@jpdve.local', 'Jonatan', 'Aguirre', 'LEADER', 'LIDER', 'E5.6.1', augusto.id);
  await createUser('jordi@jpdve.local', 'Jordi', 'González', 'LEADER', 'LIDER', 'E5.6.2', augusto.id);
  await createUser('marlone@jpdve.local', 'Marlone', 'Torres', 'LEADER', 'LIDER', 'E5.6.3', augusto.id);

  // Líderes bajo E5.7 (Diego Espinoza)
  await createUser('kevin@jpdve.local', 'Kevin', 'Ismare', 'LEADER', 'LIDER', 'E5.7.1', diego.id);
  await createUser('ismael@jpdve.local', 'Ismael', 'Salcedo', 'LEADER', 'LIDER', 'E5.7.2', diego.id);
  await createUser('diego.esp@jpdve.local', 'Diego', 'Espinosa', 'LEADER', 'LIDER', 'E5.7.3', diego.id);
  await createUser('daniel.c@jpdve.local', 'Daniel', 'Centeno', 'LEADER', 'LIDER', 'E5.7.4', diego.id);

  console.log(`✓ Users: ${Object.keys(users).length} líderes creados`);

  // ══════════════════════════════════════════════════
  // 5. GROUPS (Equipos Ministeriales)
  // ══════════════════════════════════════════════════
  const groups = {};
  const teamData = [
    { code: 'E5', name: 'Oris & Luis', slug: 'e5-principal', parent: null },
    { code: 'E5.1', name: 'Keisly & Michelle', slug: 'e5-1', parent: 'E5' },
    { code: 'E5.2', name: 'Daniela Guzmán', slug: 'e5-2', parent: 'E5' },
    { code: 'E5.3', name: 'Milagro & Paola', slug: 'e5-3', parent: 'E5' },
    { code: 'E5.4', name: 'Daniel Guzmán', slug: 'e5-4', parent: 'E5' },
    { code: 'E5.4.1', name: 'Andres & Kenneth', slug: 'e5-4-1', parent: 'E5.4' },
    { code: 'E5.4.2', name: 'Jose & Juan', slug: 'e5-4-2', parent: 'E5.4' },
    { code: 'E5.4.3', name: 'Abraham & Isaac', slug: 'e5-4-3', parent: 'E5.4' },
    { code: 'E5.5', name: 'Jair & José', slug: 'e5-5', parent: 'E5' },
    { code: 'E5.6', name: 'Augusto & Angelo', slug: 'e5-6', parent: 'E5' },
    { code: 'E5.6.1', name: 'Jonatan & Cristian', slug: 'e5-6-1', parent: 'E5.6' },
    { code: 'E5.6.2', name: 'Jordi González', slug: 'e5-6-2', parent: 'E5.6' },
    { code: 'E5.6.3', name: 'Marlone Torres', slug: 'e5-6-3', parent: 'E5.6' },
    { code: 'E5.7', name: 'Diego & Jesús', slug: 'e5-7', parent: 'E5' },
    { code: 'E5.7.1', name: 'Kevin & Victor', slug: 'e5-7-1', parent: 'E5.7' },
    { code: 'E5.7.2', name: 'Ismael & Javier', slug: 'e5-7-2', parent: 'E5.7' },
    { code: 'E5.7.3', name: 'Diego & Deivis', slug: 'e5-7-3', parent: 'E5.7' },
    { code: 'E5.7.4', name: 'Daniel & Kennedy', slug: 'e5-7-4', parent: 'E5.7' },
    { code: 'E5.8', name: 'Daphne & Erick', slug: 'e5-8', parent: 'E5' },
  ];

  for (const t of teamData) {
    const leader = users[t.code];
    const g = await prisma.group.upsert({
      where: { slug: t.slug },
      update: { name: t.name, code: t.code },
      create: {
        name: t.name, slug: t.slug, code: t.code, type: 'CELL',
        campusId: campus.id, networkId: netE5.id,
        createdById: leader?.id || oris.id,
        parentId: t.parent ? groups[t.parent]?.id : null,
      },
    });
    groups[t.code] = g;

    // Assign leader
    if (leader) {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: g.id, userId: leader.id } },
        update: {},
        create: { groupId: g.id, userId: leader.id, role: 'LEADER' },
      });
    }
  }
  console.log(`✓ Groups: ${teamData.length} equipos ministeriales`);

  // ══════════════════════════════════════════════════
  // 6. PERSONS (5-8 per team, ~100 total)
  // ══════════════════════════════════════════════════
  const names = [
    'Sofia','Valentina','Camila','Isabella','Mariana','Gabriela','Andrea','Paula','Carolina','Lucia',
    'Sebastian','Mateo','Nicolas','Santiago','Alejandro','Samuel','David','Gabriel','Lucas','Daniel',
    'Victoria','Emma','Mia','Sara','Ana','Elena','Clara','Julia','Maria','Rosa',
    'Carlos','Felipe','Diego','Andres','Jose','Luis','Miguel','Rafael','Pablo','Ivan',
  ];
  const stageKeys = ['VISITANTE','CONSOLIDADO','ACADEMIA_N1','ACADEMIA_N2','SERVIDOR','LIDER_POTENCIAL'];
  let personCount = 0;

  const operationalTeams = Object.entries(groups).filter(([code]) => !['E5','E5.4','E5.6','E5.7'].includes(code));

  for (const [code, group] of operationalTeams) {
    const count = 5 + Math.floor(Math.random() * 4); // 5-8 per team
    for (let i = 0; i < count; i++) {
      const firstName = names[Math.floor(Math.random() * names.length)];
      const lastName = names[Math.floor(Math.random() * names.length)];
      const stageCode = stageKeys[Math.floor(Math.random() * stageKeys.length)];
      await prisma.person.create({
        data: {
          firstName, lastName,
          phone: `+507 6${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          campusId: campus.id,
          currentGroupId: group.id,
          pipelineStageId: stages[stageCode],
        },
      }).catch(() => {});
      personCount++;
    }
  }
  console.log(`✓ Persons: ${personCount} distribuidas en pipeline`);

  // ══════════════════════════════════════════════════
  // 7. CELL REPORTS (12 meses de historial)
  // ══════════════════════════════════════════════════
  let reportCount = 0;
  const now = new Date();

  for (const [code, group] of operationalTeams) {
    const leader = users[code];
    if (!leader) continue;

    for (let week = 52; week >= 1; week--) {
      // Skip some weeks randomly for realism (10% chance of not reporting)
      if (Math.random() < 0.1) continue;

      const meetingDate = new Date(now);
      meetingDate.setDate(meetingDate.getDate() - (week * 7));
      meetingDate.setDate(meetingDate.getDate() - meetingDate.getDay()); // Sunday

      const men = 2 + Math.floor(Math.random() * 5);
      const women = 3 + Math.floor(Math.random() * 5);
      const youth = 2 + Math.floor(Math.random() * 4);
      const children = Math.floor(Math.random() * 3);
      const visitors = Math.floor(Math.random() * 3);

      await prisma.cellReport.create({
        data: {
          groupId: group.id,
          reporterId: leader.id,
          cellCode: code,
          meetingDate,
          coverageName: 'Oris Alvarez',
          leaderName: `${leader.firstName} ${leader.lastName}`,
          menCount: men,
          womenCount: women,
          youthMaleCount: Math.floor(youth / 2),
          youthFemaleCount: Math.ceil(youth / 2),
          childrenCount: children,
          totalAttendance: men + women + youth + children,
          visitorsCount: visitors,
          convertsCount: Math.floor(Math.random() * 2),
          reconciledCount: 0,
          startTime: '19:00',
          endTime: '21:00',
          offeringAmount: 10 + Math.random() * 30,
          messageTopic: ['La Fe','Oración','Servicio','Amor','Esperanza','Gracia'][Math.floor(Math.random() * 6)],
          wasSupervised: Math.random() > 0.7,
        },
      }).catch(() => {});
      reportCount++;
    }
  }
  console.log(`✓ Reports: ${reportCount} (12 meses de historial)`);

  // ══════════════════════════════════════════════════
  // 8. OPERATIONAL ALERTS
  // ══════════════════════════════════════════════════
  // Teams that missed reports will naturally have gaps
  await prisma.operationalAlert.createMany({
    data: [
      { campusId: campus.id, type: 'MISSING_REPORT', targetGroupId: groups['E5.6.3']?.id, responsibleUserId: users['E5.6.3']?.id || oris.id, message: 'Equipo "Marlone Torres" (E5.6.3) sin reporte en 2+ semanas', metadata: { weeksMissing: 2 } },
      { campusId: campus.id, type: 'DECLINING_ATTENDANCE', targetGroupId: groups['E5.4.2']?.id, responsibleUserId: users['E5.4.2']?.id || oris.id, message: 'Equipo "Jose & Juan" (E5.4.2) con declive de asistencia 3 semanas', metadata: { trend: [15, 12, 9] } },
      { campusId: campus.id, type: 'ZERO_VISITORS', targetGroupId: groups['E5.8']?.id, responsibleUserId: users['E5.8']?.id || oris.id, message: 'Equipo "Daphne & Erick" (E5.8) sin visitantes en 4+ semanas', metadata: { weeksWithoutVisitors: 4 } },
    ],
    skipDuplicates: true,
  });
  console.log('✓ Alerts: 3 operativas');

  // ══════════════════════════════════════════════════
  console.log('\n═══════════════════════════════════════════════════');
  console.log(' ORGANIGRAMA E5 CARGADO EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Equipos:   ${teamData.length}`);
  console.log(` Líderes:   ${Object.keys(users).length}`);
  console.log(` Personas:  ${personCount}`);
  console.log(` Reportes:  ${reportCount}`);
  console.log(` Alertas:   3`);
  console.log('');
  console.log(' CREDENCIALES (password: ChangeMe123!)');
  console.log(' ─────────────────────────────────────');
  console.log(' Pastor General:  admin@jpdve.local');
  console.log(' Oris Alvarez:    oris@jpdve.local');
  console.log(' Daniel Guzmán:   daniel.g@jpdve.local (Cobertura E5.4)');
  console.log(' Augusto M.:      augusto@jpdve.local (Cobertura E5.6)');
  console.log(' Diego Espinoza:  diego.e@jpdve.local (Cobertura E5.7)');
  console.log(' Keisly Galvez:   keisly@jpdve.local (Líder E5.1)');
  console.log(' Kevin Ismare:    kevin@jpdve.local (Líder E5.7.1)');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
