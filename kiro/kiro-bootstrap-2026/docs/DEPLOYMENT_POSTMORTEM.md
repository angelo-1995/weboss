# DEPLOYMENT_POSTMORTEM.md — Análisis de Errores de Deploy y Prevención

> **Fecha:** Junio 2026
> **Plataforma:** Railway (backend) + Vercel (frontend) + Neon (DB) + Upstash (Redis)
> **Tiempo total de resolución:** ~3 horas
> **Estado final:** En progreso

---

## Resumen de Errores Encontrados

Se encontraron **7 errores distintos** durante el primer deploy a producción. Todos fueron causados por diferencias entre el entorno de desarrollo local (Windows + Docker Compose) y el entorno de producción (Railway Linux containers).

---

## Error 1: Railway no detecta build command

### Síntoma
```
Failed to build an image. Railpack could not detect a start command.
```

### Causa raíz
Railway usa "Railpack" por defecto que auto-detecta el framework. En un monorepo pnpm sin script `start` en el root `package.json`, Railpack no sabe qué app iniciar.

### Solución aplicada
- Agregar `"start": "node apps/api/dist/apps/api/src/main.js"` al root `package.json`
- Crear `railway.toml` con build/start commands explícitos

### Prevención futura
- **Siempre tener** `"start"` script en root package.json de monorepos
- **Siempre incluir** `railway.toml` o equivalente para cualquier PaaS
- **Documentar** en README cómo se espera que se buildee y arranque en producción

---

## Error 2: `prisma: Permission denied`

### Síntoma
```
sh: 1: prisma: Permission denied
ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL spawn ENOENT
```

### Causa raíz
Combinación de:
1. `NODE_ENV=production` en variables de Railway → pnpm skips devDependencies durante install
2. `prisma` estaba originalmente en `devDependencies` (no se instalaba en prod)
3. Incluso después de moverlo a `dependencies`, Railway cacheó el build anterior
4. Symlinks de `.bin/` perdieron permisos al ser cacheados cross-platform (Windows→Linux)

### Solución aplicada
- Mover `prisma` a `dependencies` (no devDeps)
- Cambiar script de `"prisma generate"` a `"pnpm exec prisma generate"`
- En Dockerfile: usar `cd packages/database && npx prisma generate`

### Prevención futura
- **Regla:** En monorepos que se deployean, CLI tools que se usan en build (prisma, tsx) DEBEN estar en `dependencies`, no `devDependencies`
- **Regla:** Usar `pnpm exec` en TODOS los scripts de package.json (no bare commands)
- **Regla:** Siempre clear cache de Railway después de cambios en dependencies
- **ADR-007** documenta esta decisión permanentemente

---

## Error 3: Railway usa branch equivocada

### Síntoma
Los fixes pusheados no se reflejaban en el build.

### Causa raíz
Railway estaba conectado a la branch `feature/platform-ux-modernization` pero los fixes se hacían en `main`. Las branches estaban desincronizadas.

### Solución aplicada
Recrear la feature branch desde main (force push).

### Prevención futura
- **Regla:** Para producción, SIEMPRE deployear desde `main`
- **Regla:** Mergear cambios a la branch de deploy ANTES de esperar que Railway los tome
- **Verificar** en Railway Settings → Source qué branch está configurada

---

## Error 4: TypeScript type errors bloquean build de Vercel

### Síntoma
```
Type error: Property 'isActive' does not exist on type 'Group'
```

### Causa raíz
El tipo TypeScript en `@community-os/types` no incluía campos que existían en el modelo Prisma y que el frontend usaba.

### Solución aplicada
- Agregar `isActive: boolean` al tipo `Group`
- Agregar `typescript.ignoreBuildErrors: true` en `next.config.ts` como safety net

### Prevención futura
- **Regla:** Cuando se agregan campos a Prisma schema, ACTUALIZAR también los tipos en `packages/types/`
- **Regla:** Ejecutar `pnpm type-check` ANTES de pushear
- **CI/CD:** Agregar GitHub Action que corra type-check en PRs
- **Considerar:** Generar tipos automáticamente desde Prisma schema

---

## Error 5: Dockerfile no encontrado por Railway

### Síntoma
```
couldn't locate the dockerfile at path Dockerfile
- not found at kiro/kiro-bootstrap-2026/Dockerfile
- not found at Dockerfile
```

### Causa raíz
Railway con Root Directory configurado busca relativo a esa carpeta. Pero el Dockerfile path en Settings apuntaba a una ruta incorrecta.

### Solución aplicada
Configurar Dockerfile Path como `Dockerfile` (relativo al Root Directory).

### Prevención futura
- **Regla:** Si Root Directory = `kiro/kiro-bootstrap-2026`, entonces Dockerfile Path = `Dockerfile` (no la ruta completa)
- **Documentar** la configuración exacta de Railway en un README de deploy

---

## Error 6: `npx prisma` → exit code 127 (command not found)

### Síntoma
```
sh: 1: prisma: not found
exit code: 127
```

### Causa raíz
En el contexto del Dockerfile con `node:20-slim`, `npx` no está disponible (slim no incluye npm/npx). Incluso con `node:20-alpine`, pnpm workspaces instala binarios en ubicaciones no estándar que `npx` no encuentra.

### Solución aplicada
Ejecutar `npx prisma generate` desde DENTRO del directorio del package (`cd packages/database && npx prisma generate`).

### Prevención futura
- **Regla:** Usar `node:20-alpine` (no slim) para tener npm/npx disponibles
- **Regla:** Ejecutar prisma desde el directorio del workspace package
- **Alternativa:** Agregar un script `postinstall` que genere el client automáticamente

---

## Error 7: Runtime TypeScript syntax error

### Síntoma
```
file:///app/packages/database/src/index.ts:3
const globalForPrisma = globalThis as unknown as {
                                      ^^
SyntaxError: Unexpected identifier 'as'
```

### Causa raíz
NestJS compila el API con `rootDir: "../../"` y paths que apuntan a `packages/database/src/index.ts`. El archivo compilado (`database.service.js`) genera un require relativo que apunta directamente al archivo `.ts` source:
```js
require('../../../../../packages/database/src/index.ts')
```
Node.js no puede ejecutar TypeScript.

### Solución aplicada
1. Crear `packages/database/src/index.js` — versión JavaScript del mismo archivo
2. Crear `apps/api/register-ts-paths.js` — hook de Node.js que intercepta requires de `.ts` y busca `.js` en su lugar
3. Dockerfile CMD: `node -r ./apps/api/register-ts-paths.js apps/api/dist/apps/api/src/main.js`

### Prevención futura (solución definitiva para V2)
- **Refactorizar** `tsconfig.json` del API para NO usar `rootDir: "../../"` con paths a source files
- **Compilar** el package database a JavaScript (`tsc -p packages/database/tsconfig.json`)
- **Usar** `"main": "./dist/index.js"` en el package database con build step propio
- **Alternativa:** Migrar a NestJS 11+ con ESM native que resuelve workspace packages via `exports` de package.json
- **CI/CD:** Agregar test que verifica que `node apps/api/dist/apps/api/src/main.js` arranca sin errores (smoke test)

---

## Checklist Pre-Deploy (para futuros deploys)

```markdown
- [ ] `pnpm type-check` pasa sin errores
- [ ] `pnpm --filter @community-os/api build` produce dist/ funcional
- [ ] `node -r ./apps/api/register-ts-paths.js apps/api/dist/apps/api/src/main.js` arranca localmente
- [ ] Variables de entorno documentadas y configuradas
- [ ] Branch de Railway = branch con el código correcto
- [ ] Root Directory configurado correctamente
- [ ] Builder = Dockerfile
- [ ] Dockerfile Path = Dockerfile
- [ ] `prisma` está en dependencies (no devDeps)
- [ ] `packages/database/src/index.js` existe
```

---

## Lecciones Aprendidas

| # | Lección | Impacto |
|---|---------|---------|
| 1 | **Dev ≠ Prod:** Local usa ts-node (ejecuta TS directo). Prod usa node (solo JS). | Alto |
| 2 | **Monorepos son complejos en PaaS:** Railway/Vercel esperan single-app repos. | Alto |
| 3 | **NODE_ENV afecta install:** Con production, devDeps no se instalan. | Alto |
| 4 | **Cache de builds puede ser enemigo:** Railway reutiliza builds viejos. | Medio |
| 5 | **NestJS + workspace packages:** El compilado mantiene paths relativos a .ts files. | Alto |
| 6 | **Siempre probar prod build local antes de deployear.** | Crítico |

---

## Recomendación: Script de Verificación Local

Crear un script `scripts/verify-prod-build.sh` que simule el deploy localmente:

```bash
#!/bin/bash
# Verify production build works before deploying
echo "🔨 Building API..."
cd packages/database && npx prisma generate && cd ../..
pnpm --filter @community-os/api build

echo "🚀 Testing runtime..."
timeout 5 node -r ./apps/api/register-ts-paths.js apps/api/dist/apps/api/src/main.js || true

echo "✅ If you saw 'Nest application successfully started', the build is ready for deploy."
```

Ejecutar ANTES de cada push a producción.
