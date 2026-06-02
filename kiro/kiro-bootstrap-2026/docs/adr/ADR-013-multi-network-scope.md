# ADR-013: Multi-Network Scope — Pastor de Departamento

## Estado
PENDIENTE (V2 — cuando se agreguen otras redes)

## Fecha
2026-06-02

## Contexto

Alexis Maturana y Rosaura Maturana son **Pastor de Jóvenes**. Supervisan TODAS las redes juveniles (E1, E2, E3, E4, E5) pero NO deben ver la Red de Adultos (A) cuando esta se agregue al sistema.

Actualmente tienen rol `ADMIN` que les da visibilidad total. Esto funciona para el MVP porque solo existen redes E, pero se romperá cuando se agreguen otras redes/departamentos.

## Problema

El modelo actual solo soporta dos niveles:
1. **ADMIN/SUPER_ADMIN** → ve TODO (full bypass)
2. **LEADER** → ve solo su leaderCode y descendientes

No hay nivel intermedio: "ve múltiples redes específicas pero no todas".

## Solución propuesta (V2)

### Opción seleccionada: Network Assignments

Agregar tabla `user_network_assignments`:
```
userId → networkId (many-to-many)
```

El `HierarchyVisibilityService` se modificará para:
1. Si `isFullAccess(roles)` → null (sin filtro) — SUPER_ADMIN
2. Si usuario tiene `networkAssignments` → filtrar por esas redes
3. Si usuario tiene `leaderCode` → filtrar por prefix match (actual)

### Jerarquía resultante:

| Rol | Scope |
|-----|-------|
| SUPER_ADMIN | Todo — sin excepciones |
| PASTOR_DEPARTAMENTO | Redes asignadas (ej: E1-E5) — NO ve otras |
| PASTOR_RED | Su red completa (ej: E5.*) |
| COBERTURA | Sus células hijas |
| LÍDER | Su célula |

### Migración requerida (V2):

```sql
CREATE TABLE user_network_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  network_id TEXT NOT NULL REFERENCES networks(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, network_id)
);
```

## Decisión para MVP

- **Mantener ADMIN para Alexis/Rosaura** — funciona porque solo hay redes E
- **Cambiar rol a LEADER cuando se implementen otras redes** — y usar network assignments
- **Documentar la limitación** — si se agrega Red A antes de V2, se deberá cambiar a SUPER_ADMIN temporalmente o implementar esta ADR

## Consecuencias

- MVP: sin cambio, ADMIN funciona
- V2: implementar network assignments antes de agregar Red A
- Alexis/Rosaura cambiarán de ADMIN a LEADER + networkAssignments = [E1, E2, E3, E4, E5]
