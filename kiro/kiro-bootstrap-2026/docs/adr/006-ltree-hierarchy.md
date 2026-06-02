# ADR-006: Uso de LTREE para Jerarquía Ministerial

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

La estructura ministerial es un árbol jerárquico:
```
Pastor General
└── Pastor de Red
    └── Cobertura
        └── Equipo Ministerial (E4.1.2)
            └── Personas
```

Los códigos ministeriales (E, E4, E4.1, E4.1.2) representan paths en este árbol. Las operaciones frecuentes son:
- "Dame todos los descendientes de E4" (visibility de un Pastor de Red)
- "¿Quién es el ancestro directo de E4.1.2?" (determinar cobertura)
- "¿E4.1.2 es descendiente de E4?" (validar permisos)

El sistema actual usa `Group.parentId` (self-reference) + `Group.code` (string). Esto funciona pero requiere queries recursivas (CTEs) para operaciones de ancestros/descendientes.

## Decisión

Agregar una columna `ministry_code_path` de tipo `ltree` en la tabla `groups` como **campo adicional** (no reemplaza parentId ni code).

```sql
-- Extension
CREATE EXTENSION IF NOT EXISTS ltree;

-- Column
ALTER TABLE groups ADD COLUMN ministry_code_path ltree;

-- Index
CREATE INDEX idx_groups_path ON groups USING GIST (ministry_code_path);
```

### Ejemplo de valores:

| code | ministry_code_path | parentId |
|------|-------------------|----------|
| E | E | null |
| E4 | E.E4 | (id de E) |
| E4.1 | E.E4.E4_1 | (id de E4) |
| E4.1.2 | E.E4.E4_1.E4_1_2 | (id de E4.1) |

> Nota: ltree no soporta puntos en labels, se reemplazan por underscore.

## Operaciones Habilitadas

```sql
-- Todos los descendientes de E4 (una query, sin recursión)
SELECT * FROM groups WHERE ministry_code_path <@ 'E.E4';

-- Ancestros de E4.1.2 (una query)
SELECT * FROM groups WHERE ministry_code_path @> 'E.E4.E4_1.E4_1_2';

-- ¿Es descendiente? (operador)
SELECT 'E.E4.E4_1' <@ 'E.E4';  -- true

-- Profundidad
SELECT nlevel(ministry_code_path) FROM groups;
```

## Consecuencias

### Positivas
- Queries de jerarquía O(1) con índice GiST (vs CTE recursivo O(n))
- HierarchyVisibilityService puede usar ltree directamente para scope filtering
- Nativo de PostgreSQL — sin dependencias externas
- Index GiST optimizado para operaciones de árbol

### Negativas
- Prisma no soporta ltree nativamente — requiere `$queryRaw` para queries de jerarquía
- Hay que mantener sincronizado: parentId, code, Y ltree path
- Si un equipo se mueve en el árbol, hay que recalcular paths de todos los descendientes

## Estrategia de Sincronización

```typescript
// Cuando se crea o mueve un grupo:
async function syncLtreePath(group: Group): Promise<void> {
  if (!group.parentId) {
    // Root node
    await prisma.$executeRaw`
      UPDATE groups SET ministry_code_path = ${group.code}::ltree WHERE id = ${group.id}
    `;
  } else {
    // Child node: parent_path + '.' + sanitized_code
    await prisma.$executeRaw`
      UPDATE groups SET ministry_code_path = (
        SELECT ministry_code_path || ${sanitizeForLtree(group.code)}::ltree
        FROM groups WHERE id = ${group.parentId}
      ) WHERE id = ${group.id}
    `;
  }
}

function sanitizeForLtree(code: string): string {
  return code.replace(/\./g, '_');
}
```

## Relación con parentId existente

| Mecanismo | Propósito | Se mantiene |
|-----------|-----------|:-----------:|
| `Group.parentId` | Relación directa padre-hijo (Prisma relations, cascades) | ✅ |
| `Group.code` | Código visible al usuario (E4.1.2) | ✅ |
| `Group.ministry_code_path` (nuevo) | Queries de jerarquía eficientes (visibility, ancestors, descendants) | ✅ NEW |

Los tres coexisten. Cada uno tiene un propósito diferente.

## Implementación

1. **Sprint 1:** CREATE EXTENSION ltree + ADD COLUMN (nullable)
2. **Sprint 1:** Migration script: backfill paths basado en parentId chain existente
3. **Sprint 2:** HierarchyVisibilityService usa ltree para scope queries
4. **Ongoing:** Sync automático cuando se crea/mueve un grupo

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Solo parentId + CTE recursiva | Funciona pero O(n) en profundidad. No escala con 500+ grupos. |
| Nested sets | Difícil de mantener con inserciones/movimientos frecuentes. |
| Closure table | Requiere tabla adicional con N² entries. Overkill. |
| Materialized path (string LIKE) | `WHERE code LIKE 'E4.%'` no usa índices eficientemente. |
| Application-level tree cache | Inconsistencia entre cache y DB. Complejidad de invalidación. |

## Referencias
- PostgreSQL ltree documentation: https://www.postgresql.org/docs/current/ltree.html
- PRD: Códigos jerárquicos (E, E4, E4.1, E4.1.1)
- Existing: HierarchyVisibilityService (apps/api/src/common/services/)
