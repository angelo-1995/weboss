# PROJECT CONTEXT — Enterprise Community Operating System 2026

## Descripción

Sistema enterprise orientado a iglesias, organizaciones, liderazgo y comunidad. No es un CMS ni una landing page. Es un **Operating System** para gestión organizacional completa.

Construido mediante ingeniería inversa funcional de un sistema legacy (videos funcionales + HTML legacy).

## Dominios Core

```
domains/
  ├── identity       # Identidad digital del usuario
  ├── auth           # Autenticación y sesiones
  ├── users          # Perfiles, relaciones, historial
  ├── groups         # Grupos, memberships, roles contextuales
  ├── discipleship   # Estructuras jerárquicas, mentoría
  ├── leadership     # Liderazgo organizacional
  ├── memberships    # Membresías y seguimiento
  ├── relationships  # Relaciones entre personas
  ├── reporting      # Reportes grupales y de discipulado
  ├── analytics      # Dashboards, KPIs, tendencias
  ├── notifications  # Notificaciones y alertas
  ├── permissions    # RBAC + ABAC
  ├── audit          # Audit logs
  ├── campuses       # Sedes/campus
  └── ministries     # Ministerios y estructura ministerial
```

## Arquitectura Relacional

El sistema está basado en:

```
personas → relaciones → jerarquías → memberships → analytics
```

Cada entidad está conectada. No hay módulos aislados.

## Funcionalidades Core Detectadas

### IAM
- Login, onboarding, invitaciones
- Activación de usuarios, recuperación de contraseñas
- Sesiones, roles, permisos

### Personas
- CRUD usuarios, perfiles avanzados
- Redes sociales, historial, relaciones

### Groups
- Creación de grupos, memberships
- Roles contextuales, líderes, seguimiento

### Discipleship
- Estructuras jerárquicas, liderazgo, mentoría
- Relaciones organizacionales

### Reporting
- Reportes grupales y de discipulado
- Métricas y KPIs

### Analytics
- Dashboards, tendencias, crecimiento
- Métricas organizacionales

## Principios de Diseño

- **Mobile-first**: móvil → tablet → desktop
- **UI/UX 2026**: inspiración en Linear, Notion, Stripe Dashboard, ClickUp, Salesforce Lightning
- **Estilo visual**: dark/light mode, glassmorphism ligero, cards modernas, UX minimalista
- **Event-driven**: UserCreated, InvitationSent, ReportSubmitted, MembershipAdded, AnalyticsUpdated, NotificationTriggered

## Prioridad Arquitectónica

Construir primero los **CORE DOMAINS**. No comenzar por landing, marketing, streaming ni multimedia.
