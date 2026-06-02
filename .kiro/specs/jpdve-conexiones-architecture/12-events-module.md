# 12. Módulo de Eventos — J-PDVE Conexiones

> **NUEVO** — Este documento define el módulo MVP de Eventos con registro de asistencia.

---

## Propósito

Permitir la creación, publicación y gestión de eventos del ministerio con registro de asistencia de personas. Este módulo sienta las bases para el futuro sistema de QR check-in (Phase 3).

---

## Entidades

### events

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| church_id | UUID | FK → churches.id, NOT NULL | Tenant |
| title | VARCHAR(200) | NOT NULL | Título del evento |
| description | TEXT | NULL | Descripción |
| location | VARCHAR(500) | NULL | Lugar |
| latitude | DECIMAL(10,8) | NULL | GPS |
| longitude | DECIMAL(11,8) | NULL | GPS |
| start_date | TIMESTAMPTZ | NOT NULL | Fecha/hora inicio |
| end_date | TIMESTAMPTZ | NOT NULL | Fecha/hora fin |
| capacity | INTEGER | NULL | Capacidad máxima (NULL = sin límite) |
| network_id | UUID | FK → networks.id, NULL | Red organizadora (NULL = toda la iglesia) |
| status | ENUM | DEFAULT 'DRAFT' | Estado del evento |
| created_by | UUID | FK → users.id, NOT NULL | Quién creó |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | | |
| deleted_at | TIMESTAMPTZ | NULL | |

**Enums:**
- `EventStatus`: DRAFT, PUBLISHED, IN_PROGRESS, COMPLETED, CANCELLED

**Índices:** `idx_events_church_status` (church_id, status), `idx_events_dates` (start_date, end_date), `idx_events_network` (network_id)

---

### event_attendances

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | |
| event_id | UUID | FK → events.id, NOT NULL | |
| person_id | UUID | FK → persons.id, NOT NULL | Persona registrada |
| registered_at | TIMESTAMPTZ | DEFAULT NOW() | Cuándo se registró |
| attended | BOOLEAN | DEFAULT false | ¿Asistió realmente? |
| check_in_at | TIMESTAMPTZ | NULL | Hora de check-in (futuro: QR) |
| registered_by | UUID | FK → users.id, NOT NULL | Quién la registró |

**Índices:** `idx_attendance_event` (event_id), `idx_attendance_person` (person_id), UNIQUE (event_id, person_id)

---

## Prisma Models

```prisma
enum EventStatus {
  DRAFT
  PUBLISHED
  IN_PROGRESS
  COMPLETED
  CANCELLED

  @@map("event_status")
}

model Event {
  id          String      @id @default(uuid())
  churchId    String      @map("church_id")
  title       String      @db.VarChar(200)
  description String?     @db.Text
  location    String?     @db.VarChar(500)
  latitude    Decimal?    @db.Decimal(10, 8)
  longitude   Decimal?    @db.Decimal(11, 8)
  startDate   DateTime    @map("start_date")
  endDate     DateTime    @map("end_date")
  capacity    Int?
  networkId   String?     @map("network_id")
  status      EventStatus @default(DRAFT)
  createdBy   String      @map("created_by")
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")
  deletedAt   DateTime?   @map("deleted_at")

  // Relations
  church      Church            @relation(fields: [churchId], references: [id])
  network     Network?          @relation(fields: [networkId], references: [id])
  creator     User              @relation("EventCreatedBy", fields: [createdBy], references: [id])
  attendances EventAttendance[]

  @@index([churchId, status])
  @@index([startDate, endDate])
  @@index([networkId])
  @@map("events")
}

model EventAttendance {
  id           String    @id @default(uuid())
  eventId      String    @map("event_id")
  personId     String    @map("person_id")
  registeredAt DateTime  @default(now()) @map("registered_at")
  attended     Boolean   @default(false)
  checkInAt    DateTime? @map("check_in_at")
  registeredBy String    @map("registered_by")

  // Relations
  event  Event  @relation(fields: [eventId], references: [id])
  person Person @relation(fields: [personId], references: [id])
  registrar User @relation("AttendanceRegisteredBy", fields: [registeredBy], references: [id])

  @@unique([eventId, personId])
  @@index([eventId])
  @@index([personId])
  @@map("event_attendances")
}
```

---

## Casos de Uso

### UC-EV.1: Crear Evento

| Campo | Valor |
|-------|-------|
| **Actor** | PASTOR_RED, PASTOR_GENERAL (posición ministerial COBERTURA+) |
| **Precondición** | Actor tiene posición ministerial con scope suficiente |

**Flujo Principal:**
1. Actor llena formulario: título, descripción, lugar, fechas, capacidad
2. Actor selecciona red (o toda la iglesia)
3. Sistema valida campos (endDate > startDate, title no vacío)
4. Sistema crea evento con status DRAFT
5. Sistema registra audit log

### UC-EV.2: Publicar Evento

| Campo | Valor |
|-------|-------|
| **Actor** | Creador del evento o ADMIN |

**Flujo Principal:**
1. Actor cambia status a PUBLISHED
2. Sistema genera notificación para usuarios en scope (red o iglesia)
3. Evento visible para todos los usuarios elegibles

### UC-EV.3: Registrar Asistencia

| Campo | Valor |
|-------|-------|
| **Actor** | LIDER, CO_LIDER, COBERTURA+ |

**Flujo Principal:**
1. Actor abre evento publicado
2. Actor busca persona por nombre
3. Actor registra persona como asistente
4. Sistema crea EventAttendance con attended=false
5. Opcional: Actor marca check-in (attended=true, checkInAt=now)

**Flujos Alternos:**
- Evento lleno (capacidad alcanzada) → Error "Evento lleno"
- Persona ya registrada → Error "Ya registrada"
- Evento no publicado → Error 403

### UC-EV.4: Marcar Check-In

| Campo | Valor |
|-------|-------|
| **Actor** | LIDER+ en el evento |

**Flujo Principal:**
1. Actor selecciona persona registrada
2. Sistema marca attended=true, checkInAt=now
3. Futuro: Escaneo QR automático

### UC-EV.5: Ver Eventos

| Campo | Valor |
|-------|-------|
| **Actor** | Cualquier user autenticado |

**Flujo Principal:**
1. Actor ve lista de eventos PUBLISHED + IN_PROGRESS
2. Filtros: próximos, pasados, por red
3. Cada card muestra: título, fecha, lugar, registrados/capacidad

---

## Wireframe: Lista de Eventos

```
┌───────────────────────────────────────────────────────────┐
│ [←] Eventos                            [+ Nuevo Evento]   │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Filtros: [Próximos] [Pasados] [Todos] [Red ▼]          │
│                                                           │
│  ─── Próximos ───                                        │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │ 📅 Congreso de Líderes 2026                 │         │
│  │    15 Jul 2026 · 9:00 AM - 5:00 PM         │         │
│  │    📍 Templo Central                         │         │
│  │    👥 85/200 registrados                     │         │
│  │    Estado: Publicado                         │         │
│  │                      [Ver] [Registrar]       │         │
│  ├─────────────────────────────────────────────┤         │
│  │ 📅 Retiro de Jóvenes                        │         │
│  │    22-23 Jul 2026 · Todo el día             │         │
│  │    📍 Finca La Bendición                     │         │
│  │    👥 45/60 registrados                      │         │
│  │    Estado: Publicado                         │         │
│  │                      [Ver] [Registrar]       │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Wireframe: Detalle de Evento + Asistencia

```
┌───────────────────────────────────────────────────────────┐
│ [←] Congreso de Líderes 2026                              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  📅 15 Jul 2026 · 9:00 AM - 5:00 PM                     │
│  📍 Templo Central, Panamá                               │
│  👥 85/200 registrados · 62 check-in                     │
│  🏷️ Toda la iglesia                                      │
│                                                           │
│  ─── Descripción ───                                     │
│  Congreso anual de capacitación para líderes...          │
│                                                           │
│  ─── Asistentes Registrados ───                          │
│                                                           │
│  🔍 [Buscar persona...        ] [+ Registrar]           │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │ ✅ Carlos Gómez      Check-in: 8:45 AM      │         │
│  │ ✅ Ana Rodríguez     Check-in: 8:52 AM      │         │
│  │ ○  Miguel Torres     (sin check-in)         │         │
│  │ ○  Laura Pérez       (sin check-in)         │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  [◀ 1 2 3 ... ▶]                                        │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Navegación (Adición)

Nueva ruta:
```
APP --> EVENTS["/app/events"]
EVENTS --> EVENT_DETAIL["/app/events/:id"]
EVENTS --> EVENT_NEW["/app/events/new"]
EVENT_DETAIL --> EVENT_ATTENDANCE["/app/events/:id/attendance"]
```

---

## Notificaciones Generadas

| Evento | Tipo Notificación | Destinatarios |
|--------|-------------------|---------------|
| Evento publicado | `EVENT_PUBLISHED` | Usuarios en scope (red o iglesia) |
| Evento próximo (24h antes) | `EVENT_REMINDER` | Personas registradas |
| Evento cancelado | `EVENT_CANCELLED` | Personas registradas |

---

## Permisos

| Acción | ADMIN | PASTOR_GENERAL | PASTOR_RED | COBERTURA | LIDER |
|--------|:-----:|:--------------:|:----------:|:---------:|:-----:|
| Crear evento | ✅ | ✅ | ✅(red) | ❌ | ❌ |
| Publicar evento | ✅ | ✅ | ✅(red) | ❌ | ❌ |
| Ver eventos | ✅ | ✅ | ✅ | ✅ | ✅ |
| Registrar asistencia | ✅ | ✅ | ✅ | ✅ | ✅(team) |
| Marcar check-in | ✅ | ✅ | ✅ | ✅ | ✅(team) |
| Cancelar evento | ✅ | ✅ | ✅(red) | ❌ | ❌ |

---

## Relación con Módulos Existentes

| Módulo | Relación |
|--------|----------|
| Persons | EventAttendance referencia Person |
| Networks | Evento puede pertenecer a una red |
| Notifications | Genera notificaciones automáticas |
| Dashboard | Futuro: KPI de asistencia a eventos |
| Audit | Creación/publicación/cancelación se auditan |

---

## Preparación para Phase 3 (QR)

El campo `check_in_at` y la estructura de `EventAttendance` están diseñados para soportar:
- QR code por persona (futuro: tabla `person_qr_codes`)
- Escaneo que actualiza `attended=true` + `check_in_at`
- Kiosk mode para auto check-in

No se implementa QR en MVP, pero la estructura lo soporta sin migración.
