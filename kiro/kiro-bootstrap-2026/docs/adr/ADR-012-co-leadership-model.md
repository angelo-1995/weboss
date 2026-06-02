# ADR-012: Co-Leadership Model — Liderazgo Compartido

## Estado
APROBADO

## Fecha
2026-06-02

## Contexto

El modelo actual de jerarquía usa `leaderCode` con notación de punto para representar la estructura ministerial:
```
E5 → E5.1, E5.2, E5.3, E5.4, E5.5, E5.6, E5.7, E5.8
E5.6 → E5.6.1, E5.6.2, E5.6.3
```

El `HierarchyVisibilityService` usa **prefix matching**: un usuario con código `E5.6` ve todo lo que empieza con `E5.6.` (descendientes).

**Problema:** Los co-líderes fueron modelados como `E5.6.co` con `leaderId = Augusto`. Esto:
1. Crea una relación jerárquica padre-hijo que no existe ministerialmente
2. El código `E5.6.co` no matchea con `E5.6.` en el prefix search
3. Angelo no ve las células hijas E5.6.1, E5.6.2, E5.6.3

**Realidad ministerial:** Augusto y Angelo son **pares** — ambos administran E5.6 con el mismo nivel de autoridad. No hay subordinación.

## Decisión

### Regla: Co-líderes comparten el MISMO leaderCode

Un co-líder debe tener **el mismo `leaderCode`** que el líder principal. La diferenciación se hace mediante el campo `role` en `GroupMember` (LEADER vs CO_LEADER), no mediante el código jerárquico.

### Modelo corregido

| Usuario | leaderCode | role en grupo | Relación |
|---------|-----------|---------------|----------|
| Augusto | `E5.6` | LEADER | Par |
| Angelo | `E5.6` | CO_LEADER | Par |

Ambos:
- Ven E5.6, E5.6.1, E5.6.2, E5.6.3 (prefix match `E5.6.`)
- Tienen el mismo scope ministerial
- Aparecen como nodo compartido en organigrama

### `leaderId` para co-líderes

`leaderId` NO debe apuntar al otro co-líder. Debe apuntar al **supervisor real** (en este caso, Oris como líder de red).

| Campo | Augusto | Angelo |
|-------|---------|--------|
| leaderCode | E5.6 | E5.6 |
| leaderId | → Oris (E5) | → Oris (E5) |
| role en E5.6 | LEADER | CO_LEADER |

### Impacto en HierarchyVisibilityService

**No requiere cambios en el servicio.** El prefix matching ya funciona correctamente:
- `E5.6` → ve `E5.6`, `E5.6.1`, `E5.6.2`, `E5.6.3` ✓

El problema era solo de **datos** (leaderCode incorrecto), no de **lógica**.

### Impacto en Organigrama/Cobertura

La vista de organigrama debe renderizar nodos compartidos:
```
E5.6: Augusto & Angelo (Co-Cobertura)
  ├── E5.6.1: Jonatan & Cristian
  ├── E5.6.2: Jordi González
  └── E5.6.3: Marlone Torres
```

No debe mostrar Angelo como subordinado de Augusto.

### Impacto en Discipulado

Con el mismo `leaderCode`, ambos verán los discípulos automáticos de E5.6.*. El ownership específico (quién es responsable de una persona en particular) se resuelve por `ownerLeaderId` en Person, no por leaderCode.

## Migración Requerida

```sql
-- Fix Angelo: cambiar leaderCode de E5.6.co a E5.6
UPDATE users SET leader_code = 'E5.6' WHERE email = 'angelo@jpdve.local';
-- Fix leaderId: Angelo reporta a Oris, no a Augusto
UPDATE users SET leader_id = (SELECT id FROM users WHERE email = 'oris@jpdve.local') WHERE email = 'angelo@jpdve.local';

-- Same pattern for ALL co-leaders in the system:
-- E5.co (Luis Hernandez) → leaderCode = 'E5', leaderId = Pastor General
UPDATE users SET leader_code = 'E5' WHERE email = 'luis.h@jpdve.local';
UPDATE users SET leader_id = (SELECT id FROM users WHERE email = 'admin@jpdve.local') WHERE email = 'luis.h@jpdve.local';
```

## Regla General para Futuros Co-Líderes

```
SI un usuario es co-líder de un equipo:
  leaderCode = MISMO código que el líder principal
  role en GroupMember = CO_LEADER
  leaderId = supervisor del nivel superior (NO el otro co-líder)
```

## Consecuencias

- Co-líderes tienen scope idéntico al líder principal
- El organigrama/cobertura deben renderizar nodos compartidos
- NO se necesita un campo `isCoLeader` — ya existe el role CO_LEADER en GroupMember
- El modelo de datos NO cambia — solo los DATOS incorrectos se corrigen
- HierarchyVisibilityService NO requiere cambios de código
