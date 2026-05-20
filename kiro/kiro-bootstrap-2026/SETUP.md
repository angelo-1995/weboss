# Setup — Community OS

## Requisitos

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker Desktop corriendo

---

## 1. Instalar dependencias

```bash
cd kiro/kiro-bootstrap-2026
pnpm install
```

---

## 2. Variables de entorno

```bash
cp .env.example .env
```

El `.env.example` ya tiene valores válidos para desarrollo local. No necesitas cambiar nada para empezar.

---

## 3. Levantar servicios (Docker)

```bash
pnpm docker:up
```

Esto levanta:
| Servicio | Puerto | URL |
|----------|--------|-----|
| PostgreSQL | 5432 | — |
| Redis | 6379 | — |
| MailDev (SMTP) | 1025/1080 | http://localhost:1080 |
| Meilisearch | 7700 | http://localhost:7700 |

Verificar que estén corriendo:
```bash
docker ps
```

---

## 4. Base de datos

```bash
# Generar Prisma client
pnpm db:generate

# Correr migrations
pnpm db:migrate

# Seed con datos de prueba
pnpm db:seed
```

Credenciales del seed:
| Usuario | Email | Password |
|---------|-------|----------|
| Super Admin | admin@community-os.local | Admin1234! |
| Líder | lider@community-os.local | Admin1234! |
| Miembro | juan@community-os.local | Admin1234! |

---

## 5. Levantar apps

En terminales separadas:

```bash
# Terminal 1 — API (NestJS) en puerto 4000
pnpm --filter @community-os/api dev

# Terminal 2 — Web (Next.js) en puerto 3000
pnpm --filter @community-os/web dev
```

---

## 6. URLs

| App | URL |
|-----|-----|
| Web App | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger Docs | http://localhost:4000/api/docs |
| Health Check | http://localhost:4000/api/v1/health |
| MailDev | http://localhost:1080 |

---

## 7. Probar la API rápido

```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@community-os.local","password":"Admin1234!"}'

# Guardar el token y usarlo
TOKEN="<accessToken del response>"

# Ver usuarios
curl http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer $TOKEN"

# Ver grupos
curl http://localhost:4000/api/v1/groups \
  -H "Authorization: Bearer $TOKEN"

# KPIs analytics
curl http://localhost:4000/api/v1/analytics/kpis \
  -H "Authorization: Bearer $TOKEN"

# Reporte overview
curl http://localhost:4000/api/v1/reports/overview \
  -H "Authorization: Bearer $TOKEN"

# Búsqueda global
curl "http://localhost:4000/api/v1/search?q=juan" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

**Error: Cannot connect to database**
```bash
docker ps  # verificar que postgres esté corriendo
pnpm docker:up
```

**Error: Prisma client not generated**
```bash
pnpm db:generate
```

**Error: pnpm not found**
```bash
npm install -g pnpm@9
```

**Puerto 3000 o 4000 ocupado**
```bash
# Cambiar en .env
APP_PORT=4001
# O matar el proceso
npx kill-port 4000
```
