# DEPLOYMENT_POSTMORTEM.md — Análisis Completo de Errores de Deploy

> **Fecha:** Junio 2026
> **Plataforma:** Railway (backend) + Vercel (frontend) + Neon (DB) + Upstash (Redis)
> **Tiempo total de resolución:** ~6 horas
> **Estado final:** ✅ RESUELTO — API en producción

---

## Resumen

Se encontraron **10 errores distintos** durante el primer deploy a producción. Todos causados por diferencias entre el entorno local (Windows + Docker Compose + ts-node) y producción (Railway Linux containers + Node.js compilado).

---

## Error 1: Railway no detecta start command

### Síntoma
```
Failed to build an image. Railpack could not detect a start command.
```

### Causa raíz
Railway usa "Railpack" por defecto. En un monorepo pnpm sin script `start` en root, no sabe qué app iniciar.

### Solución
- Crear `railway.toml` con build/start commands explícitos
- Agregar `"start"` script en root package.json

### Prevención
- **Regla:** Siempre incluir `railway.toml` para cualquier PaaS con monorepo
- **Checklist:** Verificar que start command apunte al archivo correcto

---

## Error 2: `prisma: Permission denied` / `ENOENT`

### Síntoma
```
sh: 1: prisma: Permission denied
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL spawn ENOENT
```

### Causa raíz
`NODE_ENV=production` → pnpm no instala devDependencies → `prisma` CLI no disponible.

### Solución
- Mover `prisma` a `dependencies`
- Usar `pnpm exec prisma generate` en scripts

### Prevención
- **Regla:** CLI tools usados en build (prisma, tsx) van en `dependencies`
- **Regla:** Usar `pnpm exec` en TODOS los scripts (ADR-007)

---

## Error 3: Railway usa branch equivocada

### Síntoma
Fixes no se reflejaban en builds.

### Causa raíz
Railway conectado a `feature/platform-ux-modernization` pero fixes en `main`.

### Solución
Sincronizar branches (merge a main, redeploy).

### Prevención
- **Regla:** Producción SIEMPRE deploy desde `main`
- **Verificar:** Railway Settings → Source → Branch antes de cada debug

---

## Error 4: TypeScript type errors bloquean Vercel

### Síntoma
```
Type error: Property 'isActive' does not exist on type 'Group'
```

### Solución
- Agregar campos faltantes a `packages/types/`
- `typescript.ignoreBuildErrors: true` como safety net temporal

### Prevención
- **Regla:** Al agregar campos Prisma, actualizar `packages/types/`
- **CI/CD:** type-check obligatorio antes de merge

---

## Error 5: Dockerfile path incorrecto

### Síntoma
```
couldn't locate the dockerfile at path Dockerfile
```

### Causa raíz
Root Directory en Railway = `kiro/kiro-bootstrap-2026`, Dockerfile Path debía ser relativo.

### Solución
Configurar Dockerfile Path = `Dockerfile` (relativo al Root Directory).

### Prevención
- **Regla:** Si Root Directory está configurado, paths son relativos a ese directorio

---

## Error 6: Runtime — require de archivos .ts en producción

### Síntoma
```
SyntaxError: Unexpected identifier 'as'
require('../../../../../packages/database/src/index.ts')
```

### Causa raíz
`tsconfig.json` tenía `rootDir: "../../"` y `paths` que apuntaban a source files. NestJS compilaba con rutas relativas a `.ts`.

### Solución DEFINITIVA
- Eliminar `paths` del tsconfig
- Cambiar `rootDir` a `"./src"`
- El compilado ahora usa `require("@community-os/database")` (resolución estándar Node.js)

### Prevención
- **Regla:** NUNCA usar `rootDir` que incluya packages externos
- **Regla:** NUNCA usar `paths` en tsconfig de producción que apunten a `.ts` de otros packages
- **Test:** Verificar que `dist/` no contenga `require('*.ts')` después de build

---

## Error 7: `dist/index.js` no existe en el container

### Síntoma
```
Cannot find module '/app/apps/api/node_modules/@community-os/database/dist/index.js'
```

### Causa raíz
`packages/database/dist/index.js` estaba en `.gitignore`. No se subía a GitHub → no existía en el container de Railway.

### Solución
- `git add --force packages/database/dist/index.js`
- Trackear el archivo manualmente hasta que se implemente build automático

### Prevención
- **Regla:** Archivos requeridos en runtime DEBEN estar en git O generarse en el Dockerfile
- **DEBT-004:** Implementar build step automático para database package

---

## Error 8: Secrets con palabras prohibidas por Zod

### Síntoma
App crasheaba silenciosamente. Deploy Logs solo mostraban "Starting Container" y nada más.

### Causa raíz
`env.schema.ts` tiene validación `superRefine` que en `production` rechaza secrets que contengan: `secret`, `changeme`, `password`, etc. Los valores configurados incluían la palabra "secret":
```
JWT_SECRET=jpdve-pilot-2026-jwt-secret-very-long-random-string...
```

### Solución
Cambiar valores a strings que NO contengan palabras prohibidas.

### Prevención
- **Regla:** DOCUMENTAR en README qué validaciones aplican a env vars en production
- **Regla:** Agregar `console.log` ANTES de la validación para confirmar que llegó al punto
- **Mejora:** Hacer que la validación Zod logee el error a stdout antes de throw
- **Checklist pre-deploy:** Verificar que secrets no contengan: secret, changeme, password, change-me, default, dev-secret, test-secret, placeholder

---

## Error 9: Redis TLS no parseado correctamente

### Síntoma
App no arrancaba. BullMQ intentaba conectar a Upstash pero fallaba silenciosamente.

### Causa raíz
`@nestjs/bull` recibía `REDIS_URL` como string (`rediss://...`). Internamente ioredis necesita opciones separadas para TLS. Pasar URL directamente a BullModule no activa TLS correctamente.

### Solución
Parsear URL manualmente en `queue.module.ts` y `cache.module.ts`:
```typescript
const parsedUrl = new URL(redisUrl);
return {
  redis: {
    host: parsedUrl.hostname,
    port: parseInt(parsedUrl.port),
    password: decodeURIComponent(parsedUrl.password),
    tls: redisUrl.startsWith('rediss://') ? {} : undefined,
  }
};
```

### Prevención
- **Regla:** Para Redis con TLS (Upstash, AWS ElastiCache), SIEMPRE parsear URL manualmente
- **Regla:** No pasar `rediss://` URL directamente a BullModule o ioredis como string
- **Test:** Agregar smoke test que verifica conexión Redis al startup

---

## Error 10: Dominio Railway "Not Found"

### Síntoma
```
Not Found — The train has not arrived at the station.
```

### Causa raíz
El dominio público se había desconfigurado después de múltiples deploys fallidos. Railway no asociaba el dominio al servicio activo.

### Solución
Eliminar y recrear el dominio Railway-provided. Verificar Target Port = 4000.

### Prevención
- **Regla:** Después de cambiar `internalPort`, verificar que el dominio tenga el Target Port correcto
- **Verificar:** Settings → Networking → Domain → Port matches `internalPort`

---

## Error 11: main.ts no usa PORT de Railway

### Síntoma
App escucha en puerto 4000 pero Railway espera que use la variable `PORT`.

### Causa raíz
`main.ts` usaba `process.env['APP_PORT']` pero Railway inyecta `PORT`.

### Solución
```typescript
const port = process.env['PORT'] || process.env['APP_PORT'] || 4000;
```

### Prevención
- **Regla:** SIEMPRE usar `PORT` como primera opción (estándar PaaS)
- **Docs Railway:** "Your web server should listen on the port specified by PORT"

---

## Checklist Pre-Deploy ACTUALIZADO

```markdown
## Antes de push a producción:
- [ ] `pnpm --filter @community-os/api build` compila sin errores
- [ ] `dist/` no contiene `require('*.ts')` (buscar con grep)
- [ ] `packages/database/dist/index.js` existe y está en git
- [ ] Variables de entorno no contienen: secret, changeme, password
- [ ] JWT_SECRET ≥ 32 chars, ARGON2_PEPPER ≥ 16 chars
- [ ] REDIS_URL con `rediss://` → módulos parsean con TLS
- [ ] main.ts usa `PORT` (no solo APP_PORT)
- [ ] railway.toml `internalPort` = mismo valor que PORT/APP_PORT
- [ ] Dominio Railway tiene Target Port correcto
- [ ] Branch de Railway = main

## Smoke test local:
- [ ] node apps/api/dist/main.js (debe arrancar sin errores ~2s)
- [ ] curl http://localhost:4000/api/v1/health/live → {"status":"ok"}
```

---

## Lecciones Aprendidas (Actualizado)

| # | Lección | Impacto | Cómo evitarlo |
|---|---------|---------|---------------|
| 1 | Dev ≠ Prod: ts-node vs node | Alto | Siempre probar `node dist/main.js` local |
| 2 | Monorepos + PaaS = complejidad | Alto | railway.toml explícito + Dockerfile |
| 3 | NODE_ENV afecta install | Alto | CLI tools en dependencies |
| 4 | Cache de Railway reutiliza builds viejos | Medio | Clear cache al cambiar deps |
| 5 | Validación Zod crashea SILENCIOSAMENTE | Crítico | `.catch()` en bootstrap + logs antes de validar |
| 6 | `rediss://` ≠ `redis://` para ioredis | Alto | Parsear URL, no pasar string directo |
| 7 | `dist/` gitignored = no existe en container | Crítico | Track o generar en Dockerfile |
| 8 | Secrets con "secret" en el valor | Medio | Documentar blacklist de palabras |
| 9 | Railway PORT vs APP_PORT | Alto | Siempre usar PORT primero |
| 10 | Dominio desconfigurado tras deploys fallidos | Medio | Verificar Networking después de fix |

---

## Cronología del Incidente

| Hora (EST) | Evento |
|---|---|
| ~11:00 | Primer deploy intenta, múltiples errores de build |
| ~12:00 | Build pasa pero runtime falla (MODULE_NOT_FOUND .ts) |
| ~12:30 | Fix tsconfig: rootDir + paths eliminados |
| ~12:44 | Deploy Completed pero 502 (secrets Zod) |
| ~13:15 | Secrets cambiados, aún 502 (Redis TLS) |
| ~13:30 | Fix Redis TLS + PORT. Railway usa Dockerfile cacheado |
| ~14:00 | Dockerfile restaurado con código actualizado |
| ~14:04 | dist/index.js no existe en container |
| ~14:20 | `git add --force` dist/index.js → push |
| ~14:30 | NestJS arranca correctamente ✅ |
| ~14:38 | Health check responde 200 OK ✅ |
| ~14:40 | Login funcional desde Vercel ✅ |

**Tiempo total de indisponibilidad:** ~3.5 horas
**Causa raíz principal:** Diferencias dev/prod no validadas antes del deploy
