# DATABASE RULES

## Motor

**PostgreSQL** — obligatorio. No SQLite, no MySQL.

## Reglas Obligatorias

### Identificadores
- Todos los IDs deben ser **UUID v4** (`gen_random_uuid()`)
- Nunca usar auto-increment integers como PK pública

### Índices
- Índice en toda FK
- Índice en campos de búsqueda frecuente (`email`, `slug`, `status`)
- Índice compuesto donde aplique (ej: `[userId, groupId]`)

### Soft Deletes
- Toda tabla principal debe tener `deleted_at TIMESTAMP NULL`
- Nunca hacer `DELETE` físico en entidades de negocio
- Usar `where deleted_at IS NULL` en todas las queries activas

### Auditabilidad
- Toda tabla debe tener: `created_at`, `updated_at`, `deleted_at`
- Tablas críticas deben tener referencia a `created_by`, `updated_by`

### Relaciones
- Relaciones normalizadas — no duplicar datos
- FKs explícitas con `ON DELETE` definido (RESTRICT o SET NULL según contexto)

## Tablas Principales

```sql
users
groups
discipleships
memberships
ministries
campuses
reports
analytics
audit_logs
permissions
roles
role_permissions
user_roles
group_members
invitations
sessions
```

## Prisma Conventions

```prisma
model User {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

- Usar `@map` para snake_case en DB
- Usar camelCase en el modelo Prisma
- Siempre definir `@@map` con nombre de tabla en plural snake_case

## Migrations

- Nunca editar migrations existentes
- Siempre crear nueva migration para cambios
- Nombrar migrations descriptivamente: `add_status_to_users`, `create_memberships_table`

## Seeds

- Seeds separados por dominio
- Seeds idempotentes (usar `upsert`)
- Seeds de desarrollo NO deben correr en producción
