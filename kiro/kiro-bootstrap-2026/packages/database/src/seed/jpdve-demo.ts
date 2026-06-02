import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

/**
 * J-PDVE Conexiones Demo Data
 *
 * Creates a complete demo environment for Product Owner review.
 * Includes: users, networks, groups, persons, reports, alerts.
 */
export async function seedJpdveDemo() {
  console.log('\n🎯 Seeding J-PDVE Conexiones Demo Data...');

  const password = await argon2.hash('ChangeMe123!', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // ══════════════════════════════════════════════════════════
  // 1. CAMPUS (Church)
  // ══════════════════════════════════════════════════════════

  const campus = await prisma.campus.upsert({
    where: { slug: 'sede-central' },
    update: {
      name: 'Ministerio Palabras de Vida Eterna',
      timezone: 'America/Panama',
      churchCode: 'JPDVE',
    },
    create: {
      name: 'Ministerio Palabras de Vida Eterna',
      slug: 'sede-central',
      timezone: 'America/Panama',
      churchCode: 'JPDVE',
      address: 'Ciudad de Panamá, Panamá',
    },
  });
  console.log('  ✓ Campus: Ministerio PDVE');

  // ══════════════════════════════════════════════════════════
  // 2. NETWORKS (Redes)
  // ══════════════════════════════════════════════════════════

  const networks = [
    { code: 'E1', name: 'Red Blanca' },
    { code: 'E2', name: 'Red Verde' },
    { code: 'E3', name: 'Red Roja' },
    { code: 'E4', name: 'Red Rosada' },
    { code: 'E5', name: 'Red Naranja' },
    { code: 'E6', name: 'Red Roja II' },
  ];

  const networkMap: Record<string, string> = {};
  for (const net of networks) {
    const n = await prisma.network.upsert({
      where: { code: net.code },
      update: { name: net.name },
      create: { code: net.code, name: net.name },
    });
    networkMap[net.code] = n.id;
  }
  console.log(`  ✓ Redes: ${networks.length} creadas`);

  // ══════════════════════════════════════════════════════════
  // 3. USERS
  // ══════════════════════════════════════════════════════════

  // Pastor General
  const pastorGeneral = await prisma.user.upsert({
    where: { email: 'admin@jpdve.local' },
    update: { password },
    create: {
      email: 'admin@jpdve.local',
      password,
      firstName: 'Pastor',
      lastName: 'General',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      campusId: campus.id,
      ministerialRole: 'PASTOR_GENERAL',
      leaderCode: 'PG',
      profile: { create: { bio: 'Pastor General del Ministerio PDVE' } },
    },
  });
  console.log('  ✓ Pastor General: admin@jpdve.local');

  // Pastor de Jóvenes (Red E5)
  const pastorJovenes = await prisma.user.upsert({
    where: { email: 'pastor.jovenes@jpdve.local' },
    update: { password },
    create: {
      email: 'pastor.jovenes@jpdve.local',
      password,
      firstName: 'Roberto',
      lastName: 'Mendoza',
      status: 'ACTIVE',
      roles: ['ADMIN'],
      campusId: campus.id,
      networkId: networkMap['E5'],
      ministerialRole: 'PASTOR_RED',
      leaderCode: 'E5',
      profile: { create: { bio: 'Pastor de la Red de Jóvenes (E5 Naranja)' } },
    },
  });
  console.log('  ✓ Pastor Jóvenes: pastor.jovenes@jpdve.local');

  // Cobertura E5
  const coberturaE5 = await prisma.user.upsert({
    where: { email: 'cobertura.e5@jpdve.local' },
    update: { password },
    create: {
      email: 'cobertura.e5@jpdve.local',
      password,
      firstName: 'Daniel',
      lastName: 'Castillo',
      status: 'ACTIVE',
      roles: ['LEADER'],
      campusId: campus.id,
      networkId: networkMap['E5'],
      ministerialRole: 'COBERTURA',
      leaderCode: 'E5.C1',
      leaderId: pastorJovenes.id,
      profile: { create: {} },
    },
  });
  console.log('  ✓ Cobertura: cobertura.e5@jpdve.local');

  // Líder E5.1
  const liderE51 = await prisma.user.upsert({
    where: { email: 'lider.e51@jpdve.local' },
    update: { password },
    create: {
      email: 'lider.e51@jpdve.local',
      password,
      firstName: 'Angelo',
      lastName: 'Pérez',
      status: 'ACTIVE',
      roles: ['LEADER'],
      campusId: campus.id,
      networkId: networkMap['E5'],
      ministerialRole: 'LIDER',
      leaderCode: 'E5.1',
      leaderId: coberturaE5.id,
      phoneNumber: '+507 6000-1111',
      profile: { create: {} },
    },
  });
  console.log('  ✓ Líder E5.1: lider.e51@jpdve.local');

  // Líder E5.2
  const liderE52 = await prisma.user.upsert({
    where: { email: 'lider.e52@jpdve.local' },
    update: { password },
    create: {
      email: 'lider.e52@jpdve.local',
      password,
      firstName: 'Marcos',
      lastName: 'Ríos',
      status: 'ACTIVE',
      roles: ['LEADER'],
      campusId: campus.id,
      networkId: networkMap['E5'],
      ministerialRole: 'LIDER',
      leaderCode: 'E5.2',
      leaderId: coberturaE5.id,
      phoneNumber: '+507 6000-2222',
      profile: { create: {} },
    },
  });

  // Líder E5.3
  const liderE53 = await prisma.user.upsert({
    where: { email: 'lider.e53@jpdve.local' },
    update: { password },
    create: {
      email: 'lider.e53@jpdve.local',
      password,
      firstName: 'Laura',
      lastName: 'Vega',
      status: 'ACTIVE',
      roles: ['LEADER'],
      campusId: campus.id,
      networkId: networkMap['E5'],
      ministerialRole: 'LIDER',
      leaderCode: 'E5.3',
      leaderId: coberturaE5.id,
      phoneNumber: '+507 6000-3333',
      profile: { create: {} },
    },
  });
  console.log('  ✓ Líderes E5.2, E5.3 creados');

  // ══════════════════════════════════════════════════════════
  // 4. GROUPS (Equipos Ministeriales)
  // ══════════════════════════════════════════════════════════

  const groupE51 = await prisma.group.upsert({
    where: { slug: 'equipo-e5-1' },
    update: {},
    create: {
      name: 'Angelo & Sofía',
      slug: 'equipo-e5-1',
      code: 'E5.1',
      type: 'CELL',
      campusId: campus.id,
      networkId: networkMap['E5'],
      createdById: liderE51.id,
      neighborhood: 'Villa Lucre',
      street: 'Calle 3ra',
      houseNumber: '15',
    },
  });

  const groupE52 = await prisma.group.upsert({
    where: { slug: 'equipo-e5-2' },
    update: {},
    create: {
      name: 'Marcos & Daniela',
      slug: 'equipo-e5-2',
      code: 'E5.2',
      type: 'CELL',
      campusId: campus.id,
      networkId: networkMap['E5'],
      createdById: liderE52.id,
      neighborhood: 'San Miguelito',
      street: 'Av. Principal',
      houseNumber: '42',
    },
  });

  const groupE53 = await prisma.group.upsert({
    where: { slug: 'equipo-e5-3' },
    update: {},
    create: {
      name: 'Laura & Gabriel',
      slug: 'equipo-e5-3',
      code: 'E5.3',
      type: 'CELL',
      campusId: campus.id,
      networkId: networkMap['E5'],
      createdById: liderE53.id,
      neighborhood: 'Tocumen',
      street: 'Calle 8va',
      houseNumber: '7',
    },
  });
  console.log('  ✓ Equipos: E5.1, E5.2, E5.3 creados');

  // Assign leaders to groups
  for (const [userId, groupId] of [
    [liderE51.id, groupE51.id],
    [liderE52.id, groupE52.id],
    [liderE53.id, groupE53.id],
  ]) {
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId, userId } },
      update: {},
      create: { groupId, userId, role: 'LEADER' },
    });
  }
  console.log('  ✓ Líderes asignados a equipos');

  // ══════════════════════════════════════════════════════════
  // 5. PIPELINE STAGES (verificar que existen)
  // ══════════════════════════════════════════════════════════

  const stages = await prisma.pipelineStageConfig.findMany({
    where: { campusId: campus.id },
    orderBy: { orderIndex: 'asc' },
  });

  if (stages.length === 0) {
    console.log('  ⚠️ Pipeline stages not found. Run pipeline-stages seed first.');
    return;
  }

  const stageMap: Record<string, string> = {};
  for (const s of stages) {
    stageMap[s.code] = s.id;
  }
  console.log(`  ✓ Pipeline Stages: ${stages.length} verificados`);

  // ══════════════════════════════════════════════════════════
  // 6. PERSONS (20+ personas distribuidas)
  // ══════════════════════════════════════════════════════════

  const personsData = [
    // E5.1 - Angelo's team (8 persons)
    { firstName: 'Carlos', lastName: 'Gómez', phone: '+507 6111-0001', groupId: groupE51.id, stage: 'VISITANTE' },
    { firstName: 'María', lastName: 'Torres', phone: '+507 6111-0002', groupId: groupE51.id, stage: 'CONSOLIDADO' },
    { firstName: 'José', lastName: 'Rodríguez', phone: '+507 6111-0003', groupId: groupE51.id, stage: 'ACADEMIA_N1' },
    { firstName: 'Ana', lastName: 'Martínez', phone: '+507 6111-0004', groupId: groupE51.id, stage: 'ACADEMIA_N2' },
    { firstName: 'Luis', lastName: 'Herrera', phone: '+507 6111-0005', groupId: groupE51.id, stage: 'SERVIDOR' },
    { firstName: 'Diana', lastName: 'Castillo', phone: '+507 6111-0006', groupId: groupE51.id, stage: 'LIDER_POTENCIAL' },
    { firstName: 'Pedro', lastName: 'Vásquez', phone: null, groupId: groupE51.id, stage: 'VISITANTE' },
    { firstName: 'Sofía', lastName: 'Mendoza', phone: '+507 6111-0008', groupId: groupE51.id, stage: 'CONSOLIDADO' },

    // E5.2 - Marcos's team (7 persons)
    { firstName: 'Gabriel', lastName: 'Ortega', phone: '+507 6222-0001', groupId: groupE52.id, stage: 'VISITANTE' },
    { firstName: 'Valeria', lastName: 'Ríos', phone: '+507 6222-0002', groupId: groupE52.id, stage: 'VISITANTE' },
    { firstName: 'Alejandro', lastName: 'Pineda', phone: '+507 6222-0003', groupId: groupE52.id, stage: 'CONSOLIDADO' },
    { firstName: 'Isabella', lastName: 'Morales', phone: '+507 6222-0004', groupId: groupE52.id, stage: 'ACADEMIA_N1' },
    { firstName: 'Mateo', lastName: 'Serrano', phone: null, groupId: groupE52.id, stage: 'SERVIDOR' },
    { firstName: 'Camila', lastName: 'Flores', phone: '+507 6222-0006', groupId: groupE52.id, stage: 'LIDER_POTENCIAL' },
    { firstName: 'Andrés', lastName: 'Luna', phone: '+507 6222-0007', groupId: groupE52.id, stage: 'ACADEMIA_N3' },

    // E5.3 - Laura's team (7 persons)
    { firstName: 'Ricardo', lastName: 'Núñez', phone: '+507 6333-0001', groupId: groupE53.id, stage: 'VISITANTE' },
    { firstName: 'Fernanda', lastName: 'Aguilar', phone: '+507 6333-0002', groupId: groupE53.id, stage: 'CONSOLIDADO' },
    { firstName: 'Sebastián', lastName: 'Vargas', phone: '+507 6333-0003', groupId: groupE53.id, stage: 'ACADEMIA_N1' },
    { firstName: 'Valentina', lastName: 'Cruz', phone: '+507 6333-0004', groupId: groupE53.id, stage: 'CONSOLIDADO' },
    { firstName: 'Nicolás', lastName: 'Paz', phone: null, groupId: groupE53.id, stage: 'VISITANTE' },
    { firstName: 'Emma', lastName: 'Delgado', phone: '+507 6333-0006', groupId: groupE53.id, stage: 'SERVIDOR' },
    { firstName: 'Daniel', lastName: 'Soto', phone: '+507 6333-0007', groupId: groupE53.id, stage: 'ACADEMIA_N2' },
  ];

  for (const p of personsData) {
    const stageId = stageMap[p.stage] ?? null;
    await prisma.person.create({
      data: {
        firstName: p.firstName,
        lastName: p.lastName,
        phone: p.phone,
        campusId: campus.id,
        currentGroupId: p.groupId,
        pipelineStageId: stageId,
      },
    }).catch(() => {}); // ignore if already exists
  }
  console.log(`  ✓ Personas: ${personsData.length} creadas`);

  // ══════════════════════════════════════════════════════════
  // 7. CELL REPORTS (4 weeks of history)
  // ══════════════════════════════════════════════════════════

  const now = new Date();
  const reportWeeks = [4, 3, 2, 1]; // weeks ago

  for (const weeksAgo of reportWeeks) {
    const meetingDate = new Date(now);
    meetingDate.setDate(meetingDate.getDate() - (weeksAgo * 7));
    // Set to last Sunday
    meetingDate.setDate(meetingDate.getDate() - meetingDate.getDay());

    // E5.1 reports every week
    await prisma.cellReport.create({
      data: {
        groupId: groupE51.id,
        reporterId: liderE51.id,
        cellCode: 'E5.1',
        meetingDate,
        coverageName: 'Daniel Castillo',
        leaderName: 'Angelo Pérez',
        coLeaderName: 'Sofía Pérez',
        menCount: 3 + Math.floor(Math.random() * 3),
        womenCount: 4 + Math.floor(Math.random() * 3),
        youthMaleCount: 2 + Math.floor(Math.random() * 2),
        youthFemaleCount: 2 + Math.floor(Math.random() * 2),
        childrenCount: 1 + Math.floor(Math.random() * 2),
        totalAttendance: 12 + Math.floor(Math.random() * 5),
        visitorsCount: Math.floor(Math.random() * 3),
        convertsCount: Math.floor(Math.random() * 2),
        reconciledCount: 0,
        startTime: '19:00',
        endTime: '21:00',
        offeringAmount: 15 + Math.random() * 20,
        messageTopic: ['La Fe', 'El Amor', 'La Gracia', 'La Esperanza'][weeksAgo - 1],
        neighborhood: 'Villa Lucre',
        street: 'Calle 3ra',
        houseNumber: '15',
      },
    }).catch(() => {}); // ignore duplicates

    // E5.2 reports 3 of 4 weeks (miss week 2 = alert trigger)
    if (weeksAgo !== 2) {
      await prisma.cellReport.create({
        data: {
          groupId: groupE52.id,
          reporterId: liderE52.id,
          cellCode: 'E5.2',
          meetingDate,
          coverageName: 'Daniel Castillo',
          leaderName: 'Marcos Ríos',
          coLeaderName: 'Daniela Ríos',
          menCount: 2 + Math.floor(Math.random() * 3),
          womenCount: 3 + Math.floor(Math.random() * 3),
          youthMaleCount: 3 + Math.floor(Math.random() * 2),
          youthFemaleCount: 2 + Math.floor(Math.random() * 2),
          childrenCount: 0,
          totalAttendance: 10 + Math.floor(Math.random() * 4),
          visitorsCount: Math.floor(Math.random() * 2),
          convertsCount: 0,
          reconciledCount: 0,
          startTime: '19:30',
          endTime: '21:30',
          offeringAmount: 10 + Math.random() * 15,
          messageTopic: ['Fidelidad', 'Oración', 'Servicio', 'Comunión'][weeksAgo - 1],
          neighborhood: 'San Miguelito',
        },
      }).catch(() => {});
    }

    // E5.3 reports only first 2 weeks (2 weeks missing = alert)
    if (weeksAgo >= 3) {
      await prisma.cellReport.create({
        data: {
          groupId: groupE53.id,
          reporterId: liderE53.id,
          cellCode: 'E5.3',
          meetingDate,
          coverageName: 'Daniel Castillo',
          leaderName: 'Laura Vega',
          menCount: 2 + Math.floor(Math.random() * 2),
          womenCount: 3 + Math.floor(Math.random() * 2),
          youthMaleCount: 1,
          youthFemaleCount: 2,
          childrenCount: 1,
          totalAttendance: 9 + Math.floor(Math.random() * 3),
          visitorsCount: 0, // zero visitors for alert trigger
          convertsCount: 0,
          reconciledCount: 0,
          startTime: '18:30',
          endTime: '20:30',
          offeringAmount: 8 + Math.random() * 10,
          messageTopic: 'Perseverancia',
          neighborhood: 'Tocumen',
        },
      }).catch(() => {});
    }
  }
  console.log('  ✓ Reportes: 4 semanas de historial generado');
  console.log('    - E5.1: 4 reportes (consistente)');
  console.log('    - E5.2: 3 reportes (faltó semana 2 → alerta)');
  console.log('    - E5.3: 2 reportes (faltó semanas 1-2 → alerta)');

  // ══════════════════════════════════════════════════════════
  // 8. OPERATIONAL ALERTS (pre-generated)
  // ══════════════════════════════════════════════════════════

  await prisma.operationalAlert.create({
    data: {
      campusId: campus.id,
      type: 'MISSING_REPORT',
      targetGroupId: groupE53.id,
      responsibleUserId: liderE53.id,
      message: 'El equipo "Laura & Gabriel" (E5.3) no ha reportado en 2 semanas',
      metadata: { weeksMissing: 2 },
    },
  }).catch(() => {});

  await prisma.operationalAlert.create({
    data: {
      campusId: campus.id,
      type: 'ZERO_VISITORS',
      targetGroupId: groupE53.id,
      responsibleUserId: liderE53.id,
      message: 'El equipo "Laura & Gabriel" (E5.3) no ha tenido visitantes en 4 semanas',
      metadata: { weeksWithoutVisitors: 4 },
    },
  }).catch(() => {});

  console.log('  ✓ Alertas: 2 alertas operativas creadas');

  // ══════════════════════════════════════════════════════════
  // DONE
  // ══════════════════════════════════════════════════════════

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  J-PDVE CONEXIONES — DEMO DATA LOADED');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log('  CREDENCIALES (password: ChangeMe123!)');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Pastor General:   admin@jpdve.local');
  console.log('  Pastor Jóvenes:   pastor.jovenes@jpdve.local');
  console.log('  Cobertura E5:     cobertura.e5@jpdve.local');
  console.log('  Líder E5.1:       lider.e51@jpdve.local');
  console.log('  Líder E5.2:       lider.e52@jpdve.local');
  console.log('  Líder E5.3:       lider.e53@jpdve.local');
  console.log('');
  console.log('  DATOS CARGADOS');
  console.log('  ─────────────────────────────────────────────');
  console.log('  Redes:      6 (E1-E6)');
  console.log('  Equipos:    3 (E5.1, E5.2, E5.3)');
  console.log('  Personas:   22 (distribuidas en pipeline)');
  console.log('  Reportes:   9 (4 semanas de historial)');
  console.log('  Alertas:    2 (missing report + zero visitors)');
  console.log('═══════════════════════════════════════════════════');
}
