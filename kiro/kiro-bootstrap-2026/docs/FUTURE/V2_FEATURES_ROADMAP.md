# V2_FEATURES_ROADMAP.md — Funcionalidades Post-Piloto

> **Estado:** Documentación para planificación futura
> **Cuándo:** Después de validar MVP con piloto exitoso
> **Principio:** No implementar hasta que el piloto demuestre que el core funciona

---

## 1. Célula Operativa vs Supervisora

### Problema
Cuando un equipo se multiplica, el equipo original puede convertirse en "supervisora" (ya no hace reunión propia, solo supervisa hijos). Actualmente no hay distinción formal.

### Propuesta

Agregar campo a `groups`:
```prisma
model Group {
  // ... campos existentes ...
  cellType  CellType  @default(OPERATIONAL) @map("cell_type")
}

enum CellType {
  OPERATIONAL   // Entrega reportes, tiene reunión propia
  SUPERVISORY   // Solo supervisa células hijas, no reporta

  @@map("cell_type")
}
```

### Impacto
- Grupos tipo SUPERVISORY no aparecen en "pendientes de reporte"
- No generan alertas de "sin reporte"
- Aparecen en organigrama como nodos intermedios
- Su líder tiene acceso a reportes de los hijos

### Cuándo implementar
Después de la primera multiplicación real en el piloto.

---

## 2. Recursos (Generalización de Sermons)

### Problema
Actualmente solo existe "Sermons" (predicaciones con archivos). El Libro Maestro requiere una biblioteca completa: bosquejos, manuales, PDFs, material de academia.

### Propuesta

Opción A: **Extender Sermons** (renombrar a Resources)
```prisma
enum ResourceType {
  SERMON        // Predicación
  MANUAL        // Manual de líder, consolidación, etc.
  STUDY_GUIDE   // Guía de estudio / bosquejo
  ACADEMY       // Material de academia
  DOCUMENT      // PDF genérico
}

model Resource {
  // ... campos de Sermon existentes ...
  type  ResourceType  @default(SERMON)
}
```

Opción B: **Crear modelo paralelo** (no romper Sermons)
- Crear `Resource` nuevo
- Sermons sigue funcionando para predicaciones
- Resources cubre todo lo demás
- Fusionar en UI con tabs: "Predicaciones" | "Manuales" | "Academia"

### Recomendación
**Opción B** — No tocar lo que funciona (Sermons). Crear Resources nuevo para lo adicional.

### Cuándo implementar
Sprint 5 (después de piloto oficial exitoso).

---

## 3. Academia Completa

### Problema
El pipeline actual tiene 3 stages de academia (N1, N2, N3) pero no hay módulo de gestión de academia: inscripción, asistencia, graduación, progreso.

### Propuesta

```prisma
model AcademyLevel {
  id          String @id @default(uuid())
  campusId    String @map("campus_id")
  name        String // "Nivel 1", "Nivel 2", "Nivel 3"
  code        String // "N1", "N2", "N3"
  orderIndex  Int    @map("order_index")
  description String?
  // Relations
  enrollments AcademyEnrollment[]
}

model AcademyEnrollment {
  id          String    @id @default(uuid())
  personId    String    @map("person_id")
  levelId     String    @map("level_id")
  enrolledAt  DateTime  @default(now()) @map("enrolled_at")
  graduatedAt DateTime? @map("graduated_at")
  status      EnrollmentStatus @default(ACTIVE)
  // Tracking
  sessionsAttended Int @default(0) @map("sessions_attended")
  totalSessions    Int @default(12) @map("total_sessions")
}

enum EnrollmentStatus {
  ACTIVE
  GRADUATED
  DROPPED
  PAUSED
}
```

### Funcionalidades
- Inscribir persona a un nivel
- Registrar asistencia por sesión
- Graduar (avanza automáticamente pipeline stage)
- Dashboard: progreso de academia por red

### Cuándo implementar
Sprint 7-8 (después de estabilizar MVP + Resources).

---

## 4. Eventos + QR

### Problema
El ministerio realiza eventos (retiros, congresos, servicios especiales) y necesita registrar asistencia. Actualmente todo es manual.

### Propuesta (ya documentada en 12-events-module.md)

```prisma
model Event {
  id          String      @id @default(uuid())
  title       String
  startDate   DateTime
  endDate     DateTime
  capacity    Int?
  status      EventStatus @default(DRAFT)
  // ...
}

model EventAttendance {
  id           String    @id @default(uuid())
  eventId      String
  personId     String
  attended     Boolean   @default(false)
  checkInAt    DateTime?
}
```

### Fases de implementación

**V2.1 — Eventos básicos (Sprint 5-6)**
- CRUD de eventos
- Registro manual de asistencia
- Lista de asistentes

**V2.2 — QR Check-In (Sprint 9-10)**
- QR code por persona
- Escaneo para check-in
- Kiosk mode (tablet en entrada)
- Estadísticas de asistencia por evento

### Cuándo implementar
- Eventos básicos: después del piloto exitoso
- QR: después de tener 50+ eventos registrados

---

## 5. Tipos de Reporte Adicionales

### Problema
El Libro Maestro menciona 4 tipos: Célula, Discipulado, Academia, Reunión Especial. Solo existe Célula.

### Propuesta

No crear entidades separadas. Extender CellReport con `reportType`:

```prisma
enum ReportType {
  CELL          // Reporte de célula (actual)
  DISCIPLESHIP  // Reporte de discipulado
  ACADEMY       // Reporte de sesión de academia
  SPECIAL       // Reunión especial
}

// Agregar a CellReport:
model CellReport {
  // ... campos existentes ...
  reportType  ReportType @default(CELL) @map("report_type")
}
```

Cada tipo tendría campos diferentes relevantes (via JSONB o campos opcionales).

### Cuándo implementar
V2, después de academia.

---

## 6. Comunicaciones / Anuncios

### Propuesta simple

```prisma
model Announcement {
  id          String   @id @default(uuid())
  campusId    String   @map("campus_id")
  title       String
  body        String
  targetScope String   // 'all', 'network:E5', 'group:uuid'
  publishedAt DateTime?
  createdBy   String   @map("created_by")
  createdAt   DateTime @default(now())
}
```

- Enviar anuncio a toda la iglesia, red, o equipo específico
- Se muestra como notificación in-app
- Opcional: push notification futuro

### Cuándo implementar
Sprint 8+

---

## Resumen de Priorización V2

| # | Feature | Dependencia | Sprint Estimado |
|---|---------|-------------|:--------------:|
| 1 | Célula Operativa/Supervisora | Primera multiplicación real | 5 |
| 2 | Recursos generalizados | Piloto exitoso | 5-6 |
| 3 | Eventos básicos | Piloto exitoso | 5-6 |
| 4 | Pipeline actualizado (11 stages) | Decisión pastoral post-piloto | 5 |
| 5 | Academia módulo | Resources + Pipeline estable | 7-8 |
| 6 | QR Check-In | Eventos estable + 50 personas | 9-10 |
| 7 | Tipos de reporte adicionales | Academia | 8 |
| 8 | Comunicaciones/Anuncios | Notifications estable | 8+ |

---

> **Recordatorio:** NADA de esto se implementa antes de que el piloto valide que el core funciona. El objetivo actual es demostrar valor con reportes, personas, y dashboard.
