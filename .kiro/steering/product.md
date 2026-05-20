# Product: Community OS

Enterprise-grade platform for church/community organizational management. Built for a Panama-based church context.

## Core Domains

- **Auth & IAM**: JWT authentication, RBAC/ABAC permissions, session management
- **Users & Profiles**: Member registry with spiritual milestones and ministerial roles
- **Groups (Cells)**: Hierarchical cell groups with leaders, members, and location data
- **Networks**: Organizational hierarchy (Pastor General → Pastor Red → Cobertura → Líder → Estaca → Miembro)
- **Discipleship**: Mentor-disciple relationships, milestones, check-ins
- **Memberships**: Status tracking across groups
- **Reporting**: Cell reports with attendance, visitors, converts, offerings
- **Analytics**: KPIs, growth metrics, dashboards
- **Audit**: Full mutation logging with old/new values

## Domain Language (Spanish)

- Spiritual stages: GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO
- Redes = Networks, Coberturas = Coverage leaders, Células = Cell groups
- Estaca = Leader in training

## Key Business Rules

- Hierarchy-based visibility: leaders only see data for their subordinates
- Soft deletes across all entities (deletedAt)
- All mutations are audit-logged
- Groups cannot be deleted if they have active sub-groups
- Group creators are auto-assigned as LEADER
