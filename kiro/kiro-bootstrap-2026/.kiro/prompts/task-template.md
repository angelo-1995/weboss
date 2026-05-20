# TASK TEMPLATE — Implementación Incremental

## Estructura de una Tarea

Cada tarea de implementación debe seguir este formato:

---

## [DOMINIO] — [Nombre de la tarea]

### Objetivo
Descripción clara y concisa de qué se va a implementar.

### Arquitectura
- Módulo afectado: `domains/[nombre]`
- Capa: `[controller | service | repository | entity | dto]`
- Patrón: `[CRUD | Event | Query | Command]`

### Dependencias
- Paquetes necesarios
- Módulos que deben existir previamente
- Variables de entorno requeridas

### Archivos a crear/modificar
```
+ apps/api/src/domains/[dominio]/[archivo].ts   (nuevo)
~ apps/api/src/domains/[dominio]/[archivo].ts   (modificar)
~ packages/types/src/[dominio].ts               (modificar)
```

### Implementación

#### Paso 1 — [descripción]
```typescript
// código mínimo necesario
```

#### Paso 2 — [descripción]
```typescript
// código mínimo necesario
```

### Variables de Entorno
```env
VARIABLE_NAME=description
```

### Seguridad
- [ ] Validación de input (Zod)
- [ ] Autorización verificada
- [ ] Rate limiting si aplica
- [ ] Audit log si aplica

### Performance
- [ ] Paginación si retorna listas
- [ ] Cache si es query frecuente
- [ ] Queue si es operación lenta

### Riesgos
- Riesgo 1: descripción y mitigación
- Riesgo 2: descripción y mitigación

### Validaciones
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Validación manual en dev

### Documentación del módulo
Cada módulo debe incluir en su carpeta un `README.md` con:
- Objetivo del módulo
- Arquitectura interna
- Dependencias
- Variables de entorno
- Endpoints/eventos expuestos
- Troubleshooting

---

## Ejemplo de Tarea Mínima

**Tarea**: Agregar campo `phoneNumber` al perfil de usuario

**Archivos afectados**:
```
~ packages/database/prisma/schema.prisma
~ apps/api/src/domains/users/dto/update-user.dto.ts
~ packages/types/src/user.types.ts
```

**Cambio en schema** (solo el diff):
```prisma
model User {
  // ... campos existentes
  phoneNumber String? @map("phone_number")
}
```

**Cambio en DTO** (solo el campo nuevo):
```typescript
phoneNumber?: string; // agregar al UpdateUserDto existente
```

No regenerar el archivo completo. Solo el cambio puntual.
