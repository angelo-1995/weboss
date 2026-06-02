# ADR-010: Ministerial Scope — Única Fuente de Verdad

## Estado
APROBADO

## Fecha
2026-06-02

## Contexto

El piloto reveló que todos los endpoints devuelven datos globales sin filtrar por la posición jerárquica del usuario. El concepto de "Ministerial Scope" define exactamente qué datos puede ver cada usuario según su rol en la estructura eclesiástica.

## Decisión

### 1. Definición del Ministerial Scope

El Ministerial Scope es el conjunto de `groupIds` visibles para un usuario, determinado por `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`. Esta función es la **única fuente de verdad** para toda resolución de alcance.

### 2. Reglas de Visibilidad por Rol

| Rol | VE | NO VE |
|-----|-----|-------|
| **Líder** | Su célula, sus discípulos, sus visitantes, sus co-líderes | Otras células, otras coberturas |
| **Cobertura** | Todas sus células hijas y todos los datos de sus células hijas | Otras coberturas, otras redes |
| **Pastor de Red** | Toda su red asignada (todos los descendientes de su código) | Otras redes |
| **Pastor General** | Toda la organización sin restricciones | N/A |

### 3. VIEW_PERMISSION vs MANAGE_PERMISSION

| Funcionalidad | Pastor General | Pastor de Red | Cobertura | Líder |
|---|:-:|:-:|:-:|:-:|
| VIEW — Dashboard (scoped) | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Equipos | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Personas | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Pipeline | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Reportes | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Alertas | ✓ All | ✓ Su red | ✓ Sus hijas | ✓ Su célula |
| VIEW — Organigrama | ✓ All | ✓ All | ✓ All | ✓ All |
| VIEW — Predicaciones | ✓ All | ✓ All | ✓ All | ✓ All |
| MANAGE — Usuarios | ✓ | ✓ | ✗ | ✗ |
| MANAGE — Predicaciones | ✓ | ✓ | ✗ | ✗ |
| MANAGE — Invitaciones | ✓ | ✓ | ✗ | ✗ |
| MANAGE — Config global | ✓ | ✗ | ✗ | ✗ |

### 4. Patrón de Implementación

```typescript
// En CADA controller que maneja datos con scope:
@Get()
async findAll(@CurrentUser() user: CurrentUserData) {
  const visibleGroupIds = await this.hierarchy.getVisibleGroupIds(user.id, user.roles);
  // visibleGroupIds = null → sin filtro (admin)
  // visibleGroupIds = string[] → filtrar por estos IDs
  return this.service.findAll({ visibleGroupIds, ...otherParams });
}

// En CADA repository:
async findAll(params: { visibleGroupIds?: string[] | null }) {
  return this.prisma.entity.findMany({
    where: {
      ...(params.visibleGroupIds && { groupId: { in: params.visibleGroupIds } }),
    }
  });
}
```

### 5. Recálculo de KPIs

Los KPIs del Dashboard **DEBEN recalcularse** usando exclusivamente datos del scope visible. No es suficiente filtrar una lista global pre-calculada.

### 6. Alertas Pastorales

Las alertas se filtran por `targetGroupId IN visibleGroupIds`. Un líder nunca ve alertas de células ajenas.

## Consecuencias

- Todo endpoint de lectura con datos jerárquicos pasa por `HierarchyVisibilityService`
- Cache keys incluyen userId para evitar cross-user leaks
- Admin (SUPER_ADMIN) queda exento de todo filtro (null = sin filtro)
- No se crean módulos nuevos; se evoluciona el existente
- Frontend complementa con UI condicional pero NUNCA reemplaza la validación backend

## Aplica A

- Dashboard
- Pipeline  
- Personas
- Equipos
- Discipulado
- Reportes
- Alertas Pastorales
- KPIs
