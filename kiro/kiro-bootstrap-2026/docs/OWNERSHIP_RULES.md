# Ownership Rules — ADR-011 Implementation

## Overview

`ownerLeaderId` determines **who is responsible** for a Person's spiritual journey (edit, promote pipeline stages, register follow-up, disciple). This is separate from **visibility** (who can see the person), which is governed by `currentGroupId` + `HierarchyVisibilityService` (ADR-010).

---

## Default Ownership Assignment Rules

When a Person is created via `PersonsService.create()`:

| Creator Role | `ownerLeaderId` Assignment |
|-------------|---------------------------|
| **LEADER** (non-admin) | `ownerLeaderId = actor.id` — the leader who creates owns |
| **ADMIN / SUPER_ADMIN** | `ownerLeaderId = leader of assigned group` (if group specified), else `null` |
| **COBERTURA** (implicit via LEADER role) | `ownerLeaderId = leader of assigned group` |
| No group specified | `ownerLeaderId = null` (temporary, must be assigned later) |

### Resolution Logic

```typescript
// 1. LEADER (non-admin) → they own what they create
if (isLeader && !isAdmin) return actorId;

// 2. ADMIN/SUPER_ADMIN or COBERTURA → assign to group leader
if (currentGroupId) {
  const groupLeader = findGroupLeader(currentGroupId);
  return groupLeader?.userId ?? null;
}

// 3. No group → no owner yet
return null;
```

---

## Transfer Rule

When a person changes groups via `PersonsService.transfer()`:

1. `currentGroupId` is updated to the new group
2. `ownerLeaderId` is **automatically reassigned** to the LEADER of the new group
3. If no leader exists in the target group, `ownerLeaderId = null`

**Principle:** Ownership follows the current discipleship group, NOT the leader who originally won the person.

---

## Backward Compatibility with NULL ownerLeaderId

The `ownerLeaderId` column is **nullable**. Existing persons created before ADR-011 have `ownerLeaderId = NULL`.

### Why this is safe:

| Concern | Status |
|---------|--------|
| Visibility filtering | ✅ Uses `currentGroupId` (ADR-010) — NOT ownerLeaderId |
| List endpoints | ✅ All use `currentGroupId` for scope, unaffected |
| `OwnershipService.getPermissions()` | ✅ Returns no-permissions for persons with no owner (safe default) |
| `OwnershipService.isOwner()` | ✅ Returns `false` for NULL ownerLeaderId (no match) |
| Admin access | ✅ ADMIN/SUPER_ADMIN bypass ownership checks entirely |

### Behavior for NULL ownerLeaderId:

- Person is **visible** to anyone whose hierarchy includes the person's group
- Person is **not editable** by any non-admin user (no owner = no action permissions)
- Admin/Super_Admin can always act on any person regardless of ownership

---

## Migration Strategy for Existing Data

### Phase 1: Column Addition (DONE)

```sql
ALTER TABLE "persons" ADD COLUMN "owner_leader_id" UUID;
CREATE INDEX "persons_owner_leader_id_idx" ON "persons"("owner_leader_id");
ALTER TABLE "persons" ADD CONSTRAINT "persons_owner_leader_id_fkey"
  FOREIGN KEY ("owner_leader_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
```

### Phase 2: Backfill Script

For existing persons that have a `currentGroupId`, we backfill `ownerLeaderId` with the leader of their current group:

```sql
UPDATE persons p
SET owner_leader_id = (
  SELECT gm.user_id
  FROM group_members gm
  WHERE gm.group_id = p.current_group_id
    AND gm.role = 'LEADER'
    AND gm.left_at IS NULL
  LIMIT 1
)
WHERE p.owner_leader_id IS NULL
  AND p.current_group_id IS NOT NULL
  AND p.deleted_at IS NULL;
```

Script: `packages/database/seed-ownership-validation.mjs`

### Phase 3: Ongoing

All new persons created via the API automatically receive `ownerLeaderId` per the rules above. All transfers automatically update ownership.

---

## Permission Matrix (OwnershipService)

| Actor | canEdit | canPromote | canDisciple | canReassign | canSupervise |
|-------|---------|-----------|-------------|-------------|--------------|
| Owner (ownerLeaderId = userId) | ✓ | ✓ | ✓ | ✗ | ✓ |
| Pastor de Red | ✗ | ✗ | ✗ | ✓ | ✓ |
| Cobertura | ✗ | ✗ | ✗ | ✗ | ✓ |
| Pastor General (ADMIN) | ✓ | ✓ | ✓ | ✓ | ✓ |
| No relationship | ✗ | ✗ | ✗ | ✗ | ✗ |
| NULL ownerLeaderId | ✗ (no one) | ✗ | ✗ | ✗ | ✗ |

---

## Related ADRs

- **ADR-010**: Ministerial Scope — hierarchy-based visibility filtering
- **ADR-011**: Ministerial Ownership — action-based permission (this document)
