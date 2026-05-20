import { PrismaClient, UserRole, SpiritualStage } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

// ── Helpers ─────────────────────────────────────────────────
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Member name pools ───────────────────────────────────────
const maleNames = [
  'Andrés', 'Luis', 'Miguel', 'Fernando', 'Ricardo', 'Eduardo', 'Gabriel', 'Sebastián',
  'Tomás', 'Héctor', 'Iván', 'Omar', 'Raúl', 'Pablo', 'Ernesto', 'Julio',
  'Víctor', 'Alejandro', 'Diego', 'Samuel', 'Josué', 'Esteban', 'Fabián', 'Nicolás',
];
const femaleNames = [
  'María', 'Lucía', 'Valentina', 'Camila', 'Isabella', 'Sofía', 'Gabriela', 'Andrea',
  'Paola', 'Natalia', 'Carolina', 'Fernanda', 'Alejandra', 'Diana', 'Mónica', 'Patricia',
  'Verónica', 'Claudia', 'Lorena', 'Silvia', 'Estefanía', 'Tatiana', 'Karina', 'Yesenia',
];
const lastNames = [
  'González', 'Rodríguez', 'Martínez', 'López', 'Hernández', 'García', 'Pérez', 'Sánchez',
  'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Reyes', 'Cruz',
  'Morales', 'Ortega', 'Vargas', 'Castillo', 'Jiménez', 'Ruiz', 'Mendoza', 'Aguilar',
];
const corregimientos = ['Juan Díaz', 'Bethania', 'San Miguelito', 'Tocumen', 'Las Cumbres', 'Arraiján'];
const topics = [
  'La fe que mueve montañas', 'El fruto del Espíritu', 'Viviendo en comunidad',
  'El poder de la oración', 'Identidad en Cristo', 'Mayordomía fiel',
  'Gracia y perdón', 'Servicio al prójimo', 'La armadura de Dios',
  'Confianza en tiempos difíciles', 'El llamado de Dios', 'Adoración verdadera',
];

let maleIdx = 0, femaleIdx = 0, lastIdx = 0;
function nextMale() { return maleNames[maleIdx++ % maleNames.length]; }
function nextFemale() { return femaleNames[femaleIdx++ % femaleNames.length]; }
function nextLast() { return lastNames[lastIdx++ % lastNames.length]; }

export async function seedDemoData() {
  console.log('\n🎭 Seeding DEMO data...');

  const password = await argon2.hash('Demo1234!', {
    type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4,
  });

  // ── Campus ──────────────────────────────────────────────
  const campus = await prisma.campus.upsert({
    where: { slug: 'sede-central' },
    update: {},
    create: { name: 'Sede Central', slug: 'sede-central', address: 'Vía España, Panamá' },
  });

  // ── Networks ────────────────────────────────────────────
  const netDefs = [
    { code: 'CAB', name: 'Red de Caballeros' },
    { code: 'DAM', name: 'Red de Damas' },
    { code: 'JOV', name: 'Red de Jóvenes' },
    { code: 'JOC', name: 'Red de Jovencitas' },
    { code: 'MAT', name: 'Red de Matrimonios' },
    { code: 'NIN', name: 'Red de Niños' },
  ];
  const networks: Record<string, string> = {};
  for (const n of netDefs) {
    const net = await prisma.network.upsert({
      where: { code: n.code }, update: {}, create: { code: n.code, name: n.name },
    });
    networks[n.code] = net.id;
  }
  console.log('  ✓ Networks:', Object.keys(networks).length);

  // ── Helper to create user ───────────────────────────────
  async function createUser(data: {
    email: string; firstName: string; lastName: string; roles: UserRole[];
    leaderCode?: string; leaderId?: string; networkId?: string; spiritualStage?: SpiritualStage;
    phone?: string; spouseId?: string;
  }) {
    return prisma.user.upsert({
      where: { email: data.email },
      update: { leaderId: data.leaderId, networkId: data.networkId, spouseId: data.spouseId },
      create: {
        email: data.email,
        password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phone || `+507 6${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
        status: 'ACTIVE',
        roles: data.roles,
        campusId: campus.id,
        leaderCode: data.leaderCode,
        leaderId: data.leaderId,
        networkId: data.networkId,
        spiritualStage: data.spiritualStage || 'ENVIADO',
        profile: { create: {} },
      },
    });
  }

  // ══════════════════════════════════════════════════════════
  // 1. LEADERSHIP HIERARCHY
  // ══════════════════════════════════════════════════════════

  // Pastor Principal
  const pastor = await createUser({
    email: 'pastor@demo.community-os.local', firstName: 'Roberto', lastName: 'Castillo',
    roles: ['SUPER_ADMIN'], leaderCode: 'P1', spiritualStage: 'ENVIADO',
  });

  // Pastores de Red
  const ruben = await createUser({
    email: 'ruben@demo.community-os.local', firstName: 'Rubén', lastName: 'Aguirre',
    roles: ['ADMIN'], leaderCode: 'P1.1', leaderId: pastor.id, networkId: networks['CAB'],
    spiritualStage: 'ENVIADO',
  });
  const enelsa = await createUser({
    email: 'enelsa@demo.community-os.local', firstName: 'Enelsa', lastName: 'Aguirre',
    roles: ['ADMIN'], leaderCode: 'P1.2', leaderId: pastor.id, networkId: networks['DAM'],
    spiritualStage: 'ENVIADO',
  });
  const alexis = await createUser({
    email: 'alexis@demo.community-os.local', firstName: 'Alexis', lastName: 'Maturana',
    roles: ['LEADER'], leaderCode: 'P1.3', leaderId: pastor.id, networkId: networks['JOV'],
    spiritualStage: 'ENVIADO',
  });
  const marlen = await createUser({
    email: 'marlen@demo.community-os.local', firstName: 'Marlen', lastName: 'Fuentes',
    roles: ['LEADER'], leaderCode: 'P1.4', leaderId: pastor.id, networkId: networks['JOC'],
    spiritualStage: 'ENVIADO',
  });

  // Spouse relationships (pastors)
  await prisma.user.update({ where: { id: ruben.id }, data: { spouseId: enelsa.id } });

  // Líderes de Célula - Red Caballeros
  const marcos = await createUser({
    email: 'marcos@demo.community-os.local', firstName: 'Marcos', lastName: 'Morales',
    roles: ['LEADER'], leaderCode: 'P1.1.1', leaderId: ruben.id, networkId: networks['CAB'],
    spiritualStage: 'ENVIADO',
  });
  const daniel = await createUser({
    email: 'daniel@demo.community-os.local', firstName: 'Daniel', lastName: 'Herrera',
    roles: ['LEADER'], leaderCode: 'P1.1.2', leaderId: ruben.id, networkId: networks['CAB'],
    spiritualStage: 'ENVIADO',
  });
  const jose = await createUser({
    email: 'jose@demo.community-os.local', firstName: 'José', lastName: 'Mendoza',
    roles: ['LEADER'], leaderCode: 'P1.1.3', leaderId: ruben.id, networkId: networks['CAB'],
    spiritualStage: 'ENVIADO',
  });

  // Líderes de Célula - Red Damas
  const yamilet = await createUser({
    email: 'yamilet@demo.community-os.local', firstName: 'Yamilet', lastName: 'de Morales',
    roles: ['LEADER'], leaderCode: 'P1.2.1', leaderId: enelsa.id, networkId: networks['DAM'],
    spiritualStage: 'ENVIADO',
  });
  const rosaura = await createUser({
    email: 'rosaura@demo.community-os.local', firstName: 'Rosaura', lastName: 'de Maturana',
    roles: ['LEADER'], leaderCode: 'P1.2.2', leaderId: enelsa.id, networkId: networks['DAM'],
    spiritualStage: 'ENVIADO',
  });

  // Líderes de Célula - Red Jóvenes
  const angelo = await createUser({
    email: 'angelo@demo.community-os.local', firstName: 'Angelo', lastName: 'Navarro',
    roles: ['LEADER'], leaderCode: 'P1.3.1', leaderId: alexis.id, networkId: networks['JOV'],
    spiritualStage: 'ENVIADO',
  });
  const jesus = await createUser({
    email: 'jesus@demo.community-os.local', firstName: 'Jesús', lastName: 'Rodríguez',
    roles: ['LEADER'], leaderCode: 'P1.3.2', leaderId: alexis.id, networkId: networks['JOV'],
    spiritualStage: 'ENVIADO',
  });

  // Líderes de Célula - Red Jovencitas
  const karla = await createUser({
    email: 'karla@demo.community-os.local', firstName: 'Karla', lastName: 'Pérez',
    roles: ['LEADER'], leaderCode: 'P1.4.1', leaderId: marlen.id, networkId: networks['JOC'],
    spiritualStage: 'ENVIADO',
  });
  const daniela = await createUser({
    email: 'daniela@demo.community-os.local', firstName: 'Daniela', lastName: 'Soto',
    roles: ['LEADER'], leaderCode: 'P1.4.2', leaderId: marlen.id, networkId: networks['JOC'],
    spiritualStage: 'ENVIADO',
  });

  // Spouse: Marcos ↔ Yamilet
  await prisma.user.update({ where: { id: marcos.id }, data: { spouseId: yamilet.id } });

  console.log('  ✓ Leaders: 14 created');

  // ══════════════════════════════════════════════════════════
  // 2. CELL GROUPS
  // ══════════════════════════════════════════════════════════

  interface CellDef {
    name: string; slug: string; code: string; leader: typeof marcos; coLeaderName: string;
    networkCode: string; corregimiento: string; memberCount: number; gender: 'M' | 'F';
  }

  const cellDefs: CellDef[] = [
    { name: 'Célula A1 - Guerreros', slug: 'celula-a1', code: 'A1', leader: marcos, coLeaderName: 'Pedro Ríos', networkCode: 'CAB', corregimiento: 'Juan Díaz', memberCount: 8, gender: 'M' },
    { name: 'Célula A2 - Valientes', slug: 'celula-a2', code: 'A2', leader: daniel, coLeaderName: 'Esteban Vega', networkCode: 'CAB', corregimiento: 'Bethania', memberCount: 6, gender: 'M' },
    { name: 'Célula A3 - Conquistadores', slug: 'celula-a3', code: 'A3', leader: jose, coLeaderName: 'Raúl Pineda', networkCode: 'CAB', corregimiento: 'San Miguelito', memberCount: 5, gender: 'M' },
    { name: 'Célula D1 - Rosas de Sarón', slug: 'celula-d1', code: 'D1', leader: yamilet, coLeaderName: 'Iris Batista', networkCode: 'DAM', corregimiento: 'Tocumen', memberCount: 10, gender: 'F' },
    { name: 'Célula D2 - Perlas', slug: 'celula-d2', code: 'D2', leader: rosaura, coLeaderName: 'Marta Cedeño', networkCode: 'DAM', corregimiento: 'Las Cumbres', memberCount: 7, gender: 'F' },
    { name: 'Célula J1 - Fuego', slug: 'celula-j1', code: 'J1', leader: angelo, coLeaderName: 'Kevin Salas', networkCode: 'JOV', corregimiento: 'Arraiján', memberCount: 12, gender: 'M' },
    { name: 'Célula J2 - Impacto', slug: 'celula-j2', code: 'J2', leader: jesus, coLeaderName: 'Bryan Ortiz', networkCode: 'JOV', corregimiento: 'Juan Díaz', memberCount: 9, gender: 'M' },
    { name: 'Célula JC1 - Estrellas', slug: 'celula-jc1', code: 'JC1', leader: karla, coLeaderName: 'Génesis Ríos', networkCode: 'JOC', corregimiento: 'Bethania', memberCount: 8, gender: 'F' },
    { name: 'Célula JC2 - Princesas', slug: 'celula-jc2', code: 'JC2', leader: daniela, coLeaderName: 'Valeria Muñoz', networkCode: 'JOC', corregimiento: 'San Miguelito', memberCount: 6, gender: 'F' },
  ];

  const stages: SpiritualStage[] = ['GANADO', 'CONSOLIDADO', 'DISCIPULADO', 'ENVIADO'];
  const stageWeights = [0.1, 0.25, 0.4, 0.25]; // distribution

  function pickStage(): SpiritualStage {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < stageWeights.length; i++) {
      cum += stageWeights[i];
      if (r <= cum) return stages[i];
    }
    return 'DISCIPULADO';
  }

  const allMembers: Array<{ id: string; groupId: string; stage: SpiritualStage }> = [];
  const groups: Array<{ id: string; def: CellDef }> = [];
  let memberCounter = 1;

  for (const def of cellDefs) {
    const group = await prisma.group.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
        name: def.name, slug: def.slug, code: def.code, type: 'CELL',
        campusId: campus.id, createdById: def.leader.id, networkId: networks[def.networkCode],
        country: 'Panamá', province: 'Panamá', district: 'Panamá',
        corregimiento: def.corregimiento, neighborhood: `Barriada ${def.code}`,
        latitude: 8.97 + Math.random() * 0.1, longitude: -79.52 + Math.random() * 0.1,
      },
    });
    groups.push({ id: group.id, def });

    // Leader as GroupMember
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: def.leader.id } },
      update: {}, create: { groupId: group.id, userId: def.leader.id, role: 'LEADER' },
    });

    // Create co-leader user
    const [coFirst, coLast] = def.coLeaderName.split(' ');
    const coEmail = `${coFirst.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}${memberCounter}@demo.community-os.local`;
    const coLeader = await createUser({
      email: coEmail, firstName: coFirst, lastName: coLast,
      roles: ['MEMBER'], leaderId: def.leader.id, networkId: networks[def.networkCode],
      spiritualStage: 'DISCIPULADO',
    });
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: coLeader.id } },
      update: {}, create: { groupId: group.id, userId: coLeader.id, role: 'CO_LEADER' },
    });
    memberCounter++;

    // Create members
    for (let i = 0; i < def.memberCount; i++) {
      const stage = pickStage();
      const firstName = def.gender === 'M' ? nextMale() : nextFemale();
      const lastName2 = nextLast();
      const email = `member${memberCounter}@demo.community-os.local`;
      const member = await createUser({
        email, firstName, lastName: lastName2,
        roles: ['MEMBER'], leaderId: def.leader.id, networkId: networks[def.networkCode],
        spiritualStage: stage,
      });
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: group.id, userId: member.id } },
        update: {}, create: { groupId: group.id, userId: member.id, role: 'MEMBER' },
      });
      allMembers.push({ id: member.id, groupId: group.id, stage });
      memberCounter++;
    }
  }
  console.log(`  ✓ Groups: ${groups.length} cells with ${memberCounter - 1} total members/co-leaders`);

  // ══════════════════════════════════════════════════════════
  // 3. MEMBERSHIPS (all members ACTIVE)
  // ══════════════════════════════════════════════════════════

  for (const m of allMembers) {
    await prisma.membership.create({
      data: {
        userId: m.id, groupId: m.groupId, status: 'ACTIVE',
        startDate: daysAgo(randomBetween(30, 180)),
      },
    }).catch(() => {});
  }
  console.log(`  ✓ Memberships: ${allMembers.length}`);

  // ══════════════════════════════════════════════════════════
  // 4. CELL REPORTS (last 8 weeks per cell)
  // ══════════════════════════════════════════════════════════

  let reportCount = 0;
  for (const { id: groupId, def } of groups) {
    const skipWeek = randomBetween(0, 7); // one week missing per cell
    const skipWeek2 = def.memberCount < 7 ? randomBetween(0, 7) : -1; // smaller cells miss 2

    for (let week = 0; week < 8; week++) {
      if (week === skipWeek || week === skipWeek2) continue;

      const meetingDate = daysAgo(week * 7 + randomBetween(0, 2));
      const baseAttendance = def.memberCount + randomBetween(-2, 3);
      const total = Math.max(3, baseAttendance);
      const visitors = randomBetween(0, 3);
      const converts = visitors > 1 ? randomBetween(0, 1) : 0;

      await prisma.cellReport.upsert({
        where: { groupId_meetingDate: { groupId, meetingDate } },
        update: {},
        create: {
          groupId,
          reporterId: def.leader.id,
          cellCode: def.code,
          meetingDate,
          coverageName: def.networkCode === 'CAB' ? 'Rubén Aguirre' : def.networkCode === 'DAM' ? 'Enelsa Aguirre' : def.networkCode === 'JOV' ? 'Alexis Maturana' : 'Marlen Fuentes',
          leaderName: `${def.leader.firstName} ${def.leader.lastName}`,
          coLeaderName: def.coLeaderName,
          contactPhone: `+507 6${randomBetween(100, 999)}-${randomBetween(1000, 9999)}`,
          menCount: def.gender === 'M' ? total : randomBetween(0, 2),
          womenCount: def.gender === 'F' ? total : randomBetween(0, 2),
          youthMaleCount: def.networkCode === 'JOV' ? total : randomBetween(0, 2),
          youthFemaleCount: def.networkCode === 'JOC' ? total : randomBetween(0, 2),
          childrenCount: randomBetween(0, 3),
          totalAttendance: total + visitors,
          visitorsCount: visitors,
          convertsCount: converts,
          reconciledCount: randomBetween(0, 1),
          messageTopic: topics[randomBetween(0, topics.length - 1)],
          startTime: '19:00',
          endTime: '20:30',
          offeringAmount: randomBetween(5, 25) + 0.0,
          district: 'Panamá',
          neighborhood: def.corregimiento,
          wasSupervised: week < 2 && Math.random() > 0.6,
          observations: week === 0 ? 'Reunión con buena asistencia esta semana.' : null,
        },
      });
      reportCount++;
    }
  }
  console.log(`  ✓ Cell Reports: ${reportCount}`);

  // ══════════════════════════════════════════════════════════
  // 5. DISCIPLESHIP RELATIONSHIPS
  // ══════════════════════════════════════════════════════════

  // Coverage: Pastor → Pastores de Red
  const coveragePairs = [
    { mentor: pastor, disciple: ruben },
    { mentor: pastor, disciple: enelsa },
    { mentor: pastor, disciple: alexis },
    { mentor: pastor, disciple: marlen },
    { mentor: ruben, disciple: marcos },
    { mentor: ruben, disciple: daniel },
    { mentor: ruben, disciple: jose },
    { mentor: enelsa, disciple: yamilet },
    { mentor: enelsa, disciple: rosaura },
    { mentor: alexis, disciple: angelo },
    { mentor: alexis, disciple: jesus },
    { mentor: marlen, disciple: karla },
    { mentor: marlen, disciple: daniela },
  ];

  for (const pair of coveragePairs) {
    const rel = await prisma.discipleshipRelationship.upsert({
      where: { mentorId_discipleId_type: { mentorId: pair.mentor.id, discipleId: pair.disciple.id, type: 'COVERAGE' } },
      update: {},
      create: {
        mentorId: pair.mentor.id, discipleId: pair.disciple.id,
        type: 'COVERAGE', status: 'ACTIVE',
        startDate: daysAgo(randomBetween(90, 180)),
        createdById: pastor.id,
      },
    });

    // Add milestones to some
    if (Math.random() > 0.5) {
      await prisma.discipleshipMilestone.create({
        data: { relationshipId: rel.id, title: 'Completó Escuela de Líderes', order: 1, completedAt: daysAgo(60) },
      }).catch(() => {});
    }
  }

  // Mentor-Mentee: Leaders → some members
  const mentorPairs = allMembers.filter(m => m.stage === 'DISCIPULADO' || m.stage === 'CONSOLIDADO').slice(0, 12);
  const leaders = [marcos, daniel, jose, yamilet, rosaura, angelo, jesus, karla, daniela];
  for (let i = 0; i < mentorPairs.length; i++) {
    const mentor = leaders[i % leaders.length];
    const rel = await prisma.discipleshipRelationship.upsert({
      where: { mentorId_discipleId_type: { mentorId: mentor.id, discipleId: mentorPairs[i].id, type: 'MENTOR_MENTEE' } },
      update: {},
      create: {
        mentorId: mentor.id, discipleId: mentorPairs[i].id,
        type: 'MENTOR_MENTEE', status: 'ACTIVE',
        startDate: daysAgo(randomBetween(30, 120)),
        createdById: mentor.id, groupId: mentorPairs[i].groupId,
      },
    });

    // Check-ins for some
    if (i < 6) {
      for (let c = 0; c < 3; c++) {
        await prisma.discipleshipCheckIn.create({
          data: {
            relationshipId: rel.id,
            scheduledAt: daysAgo(c * 14 + randomBetween(0, 3)),
            completedAt: c > 0 ? daysAgo(c * 14) : null,
            notes: c > 0 ? 'Buen progreso en lectura bíblica.' : null,
            rating: c > 0 ? randomBetween(3, 5) : null,
            attendedBy: [mentor.id, mentorPairs[i].id],
          },
        }).catch(() => {});
      }
    }
  }
  console.log(`  ✓ Discipleship: ${coveragePairs.length} coverage + ${mentorPairs.length} mentor-mentee`);

  // ══════════════════════════════════════════════════════════
  // 6. STAGE TRANSITIONS (pipeline history)
  // ══════════════════════════════════════════════════════════

  let transitionCount = 0;
  for (const m of allMembers) {
    const stageOrder: SpiritualStage[] = ['GANADO', 'CONSOLIDADO', 'DISCIPULADO', 'ENVIADO'];
    const currentIdx = stageOrder.indexOf(m.stage);
    // Create history up to current stage
    let prevStage: SpiritualStage | null = null;
    for (let s = 0; s <= currentIdx; s++) {
      await prisma.stageTransition.create({
        data: {
          userId: m.id,
          fromStage: prevStage,
          toStage: stageOrder[s],
          promotedBy: leaders[transitionCount % leaders.length].id,
          notes: s === 0 ? 'Ganado en célula' : undefined,
          createdAt: daysAgo((currentIdx - s) * 30 + randomBetween(5, 25)),
        },
      }).catch(() => {});
      prevStage = stageOrder[s];
      transitionCount++;
    }
  }
  console.log(`  ✓ Stage Transitions: ${transitionCount}`);

  // ══════════════════════════════════════════════════════════
  // DONE
  // ══════════════════════════════════════════════════════════

  console.log('\n🎭 Demo data seeded successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log('  DEMO CREDENTIALS (password: Demo1234!)');
  console.log('  ─────────────────────────────────────────────────');
  console.log('  Pastor Principal:  pastor@demo.community-os.local');
  console.log('  Pastor Red:        ruben@demo.community-os.local');
  console.log('  Pastora Red:       enelsa@demo.community-os.local');
  console.log('  Líder Célula:      marcos@demo.community-os.local');
  console.log('  Líder Jóvenes:     angelo@demo.community-os.local');
  console.log('  Miembro:           member1@demo.community-os.local');
  console.log('═══════════════════════════════════════════════════');
}
