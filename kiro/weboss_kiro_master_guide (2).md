# WEBOSS — MASTER IMPROVEMENT GUIDE FOR KIRO
# Arquitectura Enterprise Moderna para Iglesia
# Version 1.0

---

# CONTEXTO DEL PROYECTO

WebOSS NO es una telco.

WebOSS es una plataforma moderna para una iglesia.

La arquitectura debe inspirarse en:
- sistemas enterprise
- plataformas modernas SaaS
- dashboards operacionales
- plataformas colaborativas
- sistemas escalables
- UX moderna y limpia

PERO:

La experiencia debe sentirse:
- humana
- espiritual
- moderna
- rápida
- limpia
- organizada
- emocionalmente agradable

NO fría como sistemas corporativos tradicionales.

---

# REGLA PRINCIPAL PARA KIRO

## MUY IMPORTANTE

SIEMPRE:
- pensar
- programar
- estructurar
- nombrar variables
- diseñar arquitectura
- escribir código
- documentar internamente

EN INGLÉS.

PERO:

Las respuestas al usuario:
- SIEMPRE en español
- UI en español
- textos visuales en español
- mensajes al usuario en español
- errores visibles en español
- documentación funcional en español

---

# OBJETIVO REAL DEL SISTEMA

Crear una plataforma moderna para iglesia que pueda incluir:

- gestión de eventos
- ministerios
- grupos
- jóvenes
- servidores
- multimedia
- transmisiones
- dashboards
- administración
- anuncios
- contenido
- asistencia
- analytics
- streaming
- membresías
- discipulados
- cursos
- recursos
- oración
- comunidad
- IA
- automatización

TODO en una sola plataforma moderna.

---

# VISIÓN DE ARQUITECTURA

La plataforma debe parecer:
- moderna
- premium
- rápida
- espiritual
- tecnológica
- minimalista

Inspiraciones:
- Notion
- Linear
- Stripe Dashboard
- Vercel
- Discord
- Slack
- Spotify
- Apple
- Church Center
- Planning Center

---

# STACK BASE APROBADO

Frontend:
- Next.js
- TypeScript
- Tailwind
- Server Components

Backend:
- NestJS
- TypeScript

Database:
- PostgreSQL
- Prisma

Infra:
- Docker
- TurboRepo
- PNPM

---

# COSAS QUE KIRO DEBE MEJORAR

# FRONTEND

## 1. REDUCIR HYDRATION

Problema:
Demasiados componentes client-side generan:
- RAM alta
- JS innecesario
- lentitud móvil

Mejoras:
- usar Server Components
- evitar use client innecesario
- lazy loading
- Suspense
- streaming

---

## 2. MEJORAR UX

La plataforma debe sentirse:
- premium
- suave
- rápida
- espiritual
- moderna

Agregar:
- transiciones suaves
- micro animaciones
- skeleton loaders
- command palette
- dark mode real
- layouts modernos
- tipografía limpia
- spacing consistente

---

## 3. TABLAS GRANDES

NUNCA cargar tablas completas.

SIEMPRE:
- pagination server-side
- virtualización
- debounce
- filtros async

Usar:
- TanStack Table
- TanStack Virtual

---

## 4. SISTEMA DE DISEÑO

Crear:
- design system central
- tokens
- spacing system
- colores oficiales
- iconografía
- componentes reutilizables

---

## 5. IDENTIDAD VISUAL

La interfaz NO debe sentirse:
- fría
- bancaria
- corporativa extrema

Debe sentirse:
- tecnológica
- cálida
- elegante
- moderna
- espiritual

---

# BACKEND

## 1. CLEAN ARCHITECTURE

Separar:
- controllers
- services
- use cases
- repositories
- domain
- infrastructure

NO mezclar lógica.

---

## 2. SERVICES PEQUEÑOS

Nunca crear:
- God Services
- controllers gigantes

Cada servicio debe tener:
- responsabilidad única
- poco acoplamiento

---

## 3. VALIDACIÓN

Toda entrada debe validarse.

Usar:
- DTOs estrictos
- Zod
- Validation Pipes

---

## 4. LOGS

NO usar console.log simples.

Usar:
- structured logging
- JSON logs
- correlation ids

---

## 5. EVENT-DRIVEN

Agregar:
- Redis
- queues
- workers

Para:
- emails
- notificaciones
- procesamiento pesado
- multimedia
- IA
- analytics

---

# PRISMA

## REGLAS IMPORTANTES

NUNCA:

```ts
include: {
  everything: true
}
```

---

SIEMPRE:
- select mínimo
- paginación
- índices
- batching

---

## QUERIES GRANDES

Si una query es pesada:
- usar raw SQL
- optimizar índices
- evitar relaciones innecesarias

---

# BASE DE DATOS

## REGLAS

- índices correctos
- relaciones claras
- migraciones limpias
- nombres consistentes

---

## EVITAR

- tablas gigantes sin índices
- queries N+1
- joins innecesarios

---

# PERFORMANCE

## KIRO DEBE SIEMPRE DETECTAR

- loops ineficientes
- RAM excesiva
- renders innecesarios
- queries lentas
- overfetching
- lógica duplicada

---

## OBJETIVO

La plataforma debe sentirse:
- instantánea
- fluida
- ligera

---

# SEGURIDAD

## IMPLEMENTAR

- Helmet
- CSP
- Rate limiting
- JWT rotation
- Refresh tokens
- CSRF protection
- audit logs

---

## NUNCA

- secretos hardcodeados
- passwords en código
- APIs sin validación

---

# AWS

## OBJETIVO

Mantener:
- bajo costo
- alta eficiencia
- fácil mantenimiento

---

# ARQUITECTURA RECOMENDADA

## FASE INICIAL

- EC2
- Docker
- PostgreSQL RDS
- S3
- Cloudflare

---

## FASE ESCALABLE

- ECS Fargate
- Redis
- ALB
- CloudWatch

---

## EVITAR TEMPRANO

- Kubernetes complejo
- EKS
- microservicios innecesarios

---

# OBSERVABILIDAD

## IMPLEMENTAR

- Grafana
- Prometheus
- Loki
- OpenTelemetry

---

## MÉTRICAS IMPORTANTES

- response time
- DB latency
- memory
- CPU
- active users
- errors
- queue depth

---

# IA

## OBJETIVO

Integrar IA para:
- asistencia
- búsqueda inteligente
- organización
- automatización
- contenido
- analytics

---

## OPTIMIZACIÓN TOKENS

KIRO SIEMPRE DEBE:
- reducir contexto innecesario
- reutilizar prompts
- evitar redundancia
- simplificar instrucciones

---

# EXPERIENCIA MODERNA

## EL SISTEMA DEBE SENTIRSE COMO

- una app moderna
- una plataforma social
- una experiencia premium
- una herramienta colaborativa

NO como:
- ERP viejo
- sistema gubernamental
- panel anticuado

---

# MODULOS FUTUROS

## POSIBLES MODULOS

- streaming
- podcasts
- música
- eventos
- check-in
- membresías
- grupos pequeños
- discipulados
- cursos
- marketplace
- donaciones
- analytics
- IA assistant
- biblioteca multimedia

---

# REGLAS DE CODIGO

## KIRO DEBE

- escribir código limpio
- usar nombres claros
- evitar duplicación
- mantener tipado fuerte
- comentar solo cuando sea necesario
- evitar complejidad innecesaria

---

# REGLAS DE PERFORMANCE

## SIEMPRE PREGUNTARSE

- ¿Esto consume demasiada RAM?
- ¿Esto puede hacerse más simple?
- ¿Esto escala?
- ¿Esto genera demasiado JS?
- ¿Esto hace demasiadas queries?
- ¿Esto costará mucho en AWS?

---

# REGLAS UI/UX

## SIEMPRE

- responsive real
- accesibilidad
- buen contraste
- navegación clara
- diseño limpio
- consistencia visual

---

# ROADMAP RECOMENDADO

# FASE 1

Objetivo:
- hardening
- seguridad
- performance
- design system

---

# FASE 2

Objetivo:
- dashboards
- analytics
- realtime
- Redis
- queues

---

# FASE 3

Objetivo:
- IA
- automatización
- multimedia
- escalabilidad

---

# FASE 4

Objetivo:
- mobile apps
- ecosystem
- integrations
- APIs públicas

---

# REGLA FINAL PARA KIRO

Debes actuar como:
- arquitecto senior
- ingeniero principal
- experto performance
- experto UX moderno
- experto AWS costo eficiente

Pero recordando siempre:

ESTO ES UNA PLATAFORMA PARA UNA IGLESIA.

La experiencia debe sentirse:
- humana
- moderna
- organizada
- tecnológica
- espiritual
- elegante
- rápida
- cálida

NO corporativa fría.

Siempre pensar:
- simple
- escalable
- eficiente
- mantenible
- moderno
- hermoso visualmente


---

# SISTEMA DE SPECS PARA KIRO

# OBJETIVO

Este proyecto debe utilizar un sistema de SPECS moderno.

Los SPECS servirán para:
- nuevas funcionalidades
- módulos
- refactors
- arquitectura
- mejoras UI/UX
- performance
- seguridad
- observabilidad
- IA
- automatizaciones

---

# REGLA PRINCIPAL

ANTES de programar algo grande:

KIRO DEBE:
1. pensar
2. analizar arquitectura
3. detectar impacto
4. crear SPEC
5. validar dependencias
6. luego programar

NO programar directamente funcionalidades complejas.

---

# CUÁNDO CREAR UN SPEC

Crear un nuevo SPEC cuando:

- exista una nueva funcionalidad
- haya cambios arquitectónicos
- se cree un módulo nuevo
- se modifique base de datos
- se agregue IA
- se cambie UX importante
- se agreguen integraciones
- exista lógica compleja
- exista impacto en performance
- exista impacto AWS
- exista procesamiento async
- exista multimedia
- exista realtime

---

# ESTRUCTURA ESTÁNDAR DE SPECS

Cada SPEC debe incluir:

## 1. CONTEXTO

- problema
- necesidad
- objetivo
- impacto

---

## 2. OBJETIVO FUNCIONAL

Qué hará exactamente.

---

## 3. EXPERIENCIA DE USUARIO

Cómo debe sentirse:
- moderna
- rápida
- limpia
- espiritual
- intuitiva

---

## 4. ARQUITECTURA

Definir:
- frontend
- backend
- database
- cache
- queues
- APIs
- workers

---

## 5. PERFORMANCE

Definir:
- optimizaciones
- caching
- paginación
- lazy loading
- streaming
- virtualización

---

## 6. SEGURIDAD

Definir:
- validación
- permisos
- auth
- auditoría
- rate limits

---

## 7. AWS/COSTO

Definir:
- impacto económico
- escalabilidad
- consumo estimado

---

## 8. UI/UX

Definir:
- diseño
- layout
- responsive
- accesibilidad
- componentes

---

## 9. ROADMAP TÉCNICO

Definir:
- fases
- prioridades
- dependencias

---

## 10. RIESGOS

Definir:
- performance
- seguridad
- complejidad
- escalabilidad

---

# REGLAS PARA CREAR SPECS

## KIRO DEBE

- pensar como arquitecto senior
- evitar sobreingeniería
- proponer solución simple primero
- optimizar costos
- minimizar complejidad
- priorizar mantenibilidad

---

# REGLAS DE NOMBRES

Los SPECS deben:
- estar en inglés internamente
- usar nombres técnicos claros
- mantener estructura consistente

Pero:
- explicaciones al usuario en español

---

# REGLAS DE PERFORMANCE EN SPECS

TODO SPEC debe responder:

- ¿esto escala?
- ¿esto consume mucha RAM?
- ¿esto hará demasiadas queries?
- ¿esto aumentará mucho el costo AWS?
- ¿esto genera demasiado JS?
- ¿esto puede simplificarse?

---

# REGLAS UI/UX PARA SPECS

TODO SPEC debe mantener:

- identidad moderna
- experiencia premium
- sensación espiritual/humana
- diseño limpio
- velocidad
- consistencia visual

---

# REGLAS DE IA PARA SPECS

Si un SPEC usa IA:

KIRO debe:
- minimizar tokens
- usar prompts reutilizables
- evitar contexto innecesario
- reducir llamadas
- usar caché si aplica

---

# REGLAS DE DATABASE PARA SPECS

Todo SPEC debe:
- evitar queries pesadas
- usar índices
- usar paginación
- evitar overfetching
- considerar crecimiento futuro

---

# REGLAS BACKEND PARA SPECS

Todo SPEC debe:
- usar arquitectura limpia
- separar responsabilidades
- evitar services gigantes
- soportar testing
- soportar escalabilidad

---

# REGLAS FRONTEND PARA SPECS

Todo SPEC debe:
- minimizar hydration
- minimizar JS
- usar Server Components
- usar lazy loading
- evitar renders innecesarios

---

# REGLAS AWS PARA SPECS

Todo SPEC debe:
- considerar costo
- evitar infraestructura innecesaria
- usar servicios simples primero
- priorizar ECS antes que Kubernetes

---

# REGLA FINAL

Cada nuevo SPEC debe ayudar a construir:

Una plataforma:
- moderna
- elegante
- espiritual
- rápida
- escalable
- eficiente
- humana
- colaborativa

Pensada para una iglesia moderna.

NO un sistema corporativo frío.
