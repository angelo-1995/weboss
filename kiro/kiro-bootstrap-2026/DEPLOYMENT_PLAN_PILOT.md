# DEPLOYMENT_PLAN_PILOT.md — Estrategia de Despliegue para Piloto

> **Objetivo:** URL pública accesible para pastor, coberturas y líderes piloto
> **Restricción:** Sin AWS, sin infraestructura compleja, costo mínimo
> **Duración:** 2-4 semanas (piloto 0 + piloto oficial)

---

## Stack Recomendado para Piloto

| Servicio | Proveedor | Plan | Costo/mes |
|----------|-----------|------|:---------:|
| Frontend (Next.js) | **Vercel** | Hobby (gratis) | $0 |
| Backend (NestJS) | **Railway** | Starter | ~$5 |
| PostgreSQL | **Neon** | Free tier | $0 |
| Redis | **Upstash** | Free tier | $0 |
| Email (dev) | No requerido para piloto | — | $0 |
| Storage (fotos) | No requerido para piloto | — | $0 |

### **Costo mensual total estimado: $5 USD**

---

## Evaluación de Opciones

### Frontend: Vercel ✅ (Recomendado)

| Criterio | Evaluación |
|----------|-----------|
| Compatibilidad Next.js 15 | Perfecto (Vercel creó Next.js) |
| Plan gratuito | Sí: builds ilimitados, 100GB bandwidth |
| Custom domain | Sí (gratis con SSL) |
| Deploy | Git push → deploy automático |
| Preview deploys | Sí (por PR) |
| Edge functions | Incluido |
| Limitaciones free tier | 1 team member, 100GB/mes bandwidth |
| Para piloto (5-8 usuarios) | Más que suficiente |

**Alternativa:** Netlify (similar, pero menos optimizado para Next.js App Router).

---

### Backend: Railway ✅ (Recomendado)

| Criterio | Evaluación |
|----------|-----------|
| Compatibilidad NestJS | Perfecto (cualquier Node.js) |
| Plan Starter | $5/mes con $5 credit incluido |
| RAM | 512MB (suficiente para piloto) |
| Deploy | Dockerfile o Nixpacks (auto-detect) |
| Custom domain | Sí (gratis) |
| SSL | Automático |
| Logs | Incluidos |
| Sleep en inactividad | No (always on en Starter) |
| Para piloto | Ideal: simple, barato, no duerme |

**Alternativa:** Render (similar pero free tier duerme después de 15 min de inactividad — mala UX).

---

### PostgreSQL: Neon ✅ (Recomendado)

| Criterio | Evaluación |
|----------|-----------|
| Free tier | 0.5GB storage, 1 proyecto, branching |
| PostgreSQL version | 16 ✅ |
| Conexiones | Pooled (ideal para serverless) |
| Branching (dev/prod) | Incluido gratis |
| Limitaciones | 0.5GB storage (suficiente para piloto con ~100 personas) |
| Backup | Automático (7 días point-in-time) |
| Latencia desde Panamá | ~100ms (servers en US East) |

**Alternativa:** Supabase (más features pero más complejo de configurar solo como DB).

---

### Redis: Upstash ✅ (Recomendado)

| Criterio | Evaluación |
|----------|-----------|
| Free tier | 10K commands/día, 256MB |
| Compatibilidad ioredis | Sí (REST API + Redis protocol) |
| Uso en el piloto | KPI cache (pocas reads) + BullMQ (pocas jobs) |
| Para 5-8 usuarios | 10K/día es más que suficiente |
| Serverless | Sí (no siempre activo, cobra por uso) |

**¿Redis es necesario para el piloto?**

Técnicamente **NO es crítico**. El sistema funciona sin Redis (queries van directo a DB). Pero con 5 usuarios el impacto es cero.

**Recomendación:** Incluir Upstash free tier para que BullMQ funcione (detección de alertas). Si da problemas, se puede desactivar temporalmente.

---

## URLs Propuestas

| Servicio | URL |
|----------|-----|
| Frontend | `https://jpdve.vercel.app` o `https://conexiones.jpdve.org` (si tienes dominio) |
| Backend API | `https://jpdve-api.up.railway.app` |
| Base de datos | (conexión interna, no pública) |

---

## Variables de Entorno Requeridas

### Backend (Railway)

```env
# Database
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Redis
REDIS_URL=rediss://default:xxx@us1-xxx.upstash.io:6379

# Auth
JWT_SECRET=generate-a-random-64-char-string
JWT_REFRESH_SECRET=generate-another-random-64-char-string
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://jpdve.vercel.app

# Optional (not needed for pilot)
# S3_BUCKET=
# S3_REGION=
# SMTP_HOST=
# SMTP_PORT=
# MEILISEARCH_URL=
# MEILISEARCH_KEY=
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://jpdve-api.up.railway.app/api/v1
```

---

## Pasos Exactos para Publicar

### Paso 1: Crear Base de Datos (Neon) — 5 min

1. Ir a [neon.tech](https://neon.tech)
2. Crear cuenta (GitHub login)
3. Crear proyecto: "jpdve-conexiones"
4. Copiar `DATABASE_URL` (connection string con `?sslmode=require`)
5. Ejecutar migraciones:
   ```bash
   cd packages/database
   DATABASE_URL="tu_neon_url" npx prisma db push
   DATABASE_URL="tu_neon_url" npx tsx src/seed/index.ts
   ```

### Paso 2: Crear Redis (Upstash) — 3 min

1. Ir a [upstash.com](https://upstash.com)
2. Crear cuenta
3. Crear database Redis: región "US East 1"
4. Copiar `REDIS_URL` (formato: `rediss://default:xxx@xxx.upstash.io:6379`)

### Paso 3: Deploy Backend (Railway) — 10 min

1. Ir a [railway.app](https://railway.app)
2. Crear cuenta (GitHub login)
3. New Project → Deploy from GitHub repo
4. Seleccionar repo `angelo-1995/weboss`
5. Configurar:
   - Root Directory: `kiro/kiro-bootstrap-2026/apps/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `node dist/main.js`
6. Agregar variables de entorno (todas las del backend)
7. Deploy → esperar build (~2-3 min)
8. Copiar URL generada (ej: `https://jpdve-api.up.railway.app`)

**Alternativa Railway con Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @community-os/api build
EXPOSE 4000
CMD ["node", "apps/api/dist/main.js"]
```

### Paso 4: Deploy Frontend (Vercel) — 5 min

1. Ir a [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Seleccionar repo `angelo-1995/weboss`
4. Configurar:
   - Framework: Next.js
   - Root Directory: `kiro/kiro-bootstrap-2026/apps/web`
5. Agregar variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL del backend Railway
6. Deploy → esperar build (~1-2 min)
7. URL lista: `https://jpdve.vercel.app`

### Paso 5: Verificar — 5 min

1. Abrir `https://jpdve.vercel.app/login`
2. Login con `admin@jpdve.local` / `ChangeMe123!`
3. Verificar dashboard carga KPIs
4. Verificar alertas visibles
5. Crear un reporte de prueba

**Tiempo total de despliegue: ~30 minutos**

---

## Consideraciones para el Piloto

### Lo que SÍ funciona sin infra adicional

- ✅ Login/Auth (JWT en memoria + DB)
- ✅ Reportes (CRUD completo)
- ✅ Personas (CRUD + pipeline)
- ✅ Dashboard KPIs (con o sin Redis cache)
- ✅ Alertas (detección manual via endpoint)
- ✅ Auditoría
- ✅ Búsqueda básica (sin Meilisearch, fallback a LIKE queries)

### Lo que NO funcionará sin config adicional

- ❌ Upload de fotos (necesita S3 — no crítico para piloto)
- ❌ Emails (necesita SMTP — no crítico para piloto)
- ❌ Búsqueda fuzzy (Meilisearch no desplegado — funciona con fallback)
- ❌ BullMQ cron jobs (si Redis no conecta, alertas se generan manualmente)

**Ninguno de estos es bloqueante para el piloto.** El core funciona sin ellos.

---

## Plan de Rollback

Si algo falla durante el piloto:

| Problema | Acción |
|----------|--------|
| Frontend roto | Revert en Vercel (1 click, instant) |
| Backend roto | Revert en Railway (1 click) |
| DB corrupta | Neon point-in-time restore (7 días) |
| Todo roto | Re-seed DB + redeploy (15 min) |

---

## Seguridad para Piloto

- [x] HTTPS automático (Vercel + Railway)
- [x] CORS restringido a frontend URL
- [x] JWT con refresh rotation
- [x] Passwords con Argon2
- [ ] Rate limiting (activar en Railway si necesario)
- [ ] Custom domain (opcional, `.vercel.app` es suficiente para piloto)

---

## Resumen

| Aspecto | Valor |
|---------|-------|
| **Costo mensual** | ~$5 USD (Railway Starter) |
| **Tiempo de setup** | ~30 minutos |
| **Complejidad** | Baja (3 servicios managed) |
| **Escalabilidad** | Suficiente para 5-20 usuarios |
| **Rollback** | 1 click en cada plataforma |
| **Custom domain** | Opcional (gratis en Vercel + Railway) |
| **SSL** | Automático en todos |
| **Mantenimiento** | Cero (todo managed) |

---

## Cuándo Migrar a AWS

Migrar a infraestructura propia (AWS) cuando:

- [ ] Piloto exitoso → expansión a toda la iglesia (50+ usuarios)
- [ ] Se necesite S3 para fotos de evidencia
- [ ] Se necesite Meilisearch para búsqueda de 500+ personas
- [ ] Volumen de reportes > 100/semana
- [ ] Se requiera SLA de disponibilidad formal

Para el piloto con 5-8 usuarios, **Vercel + Railway + Neon es la opción correcta.**
