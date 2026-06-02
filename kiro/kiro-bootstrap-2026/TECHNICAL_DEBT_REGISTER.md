# TECHNICAL_DEBT_REGISTER.md — Registro de Deuda Técnica

> **Propósito:** Documentar soluciones temporales y compromisos técnicos que requieren refactorización futura.
> **Prioridades:** CRITICAL (bloquea), HIGH (V2), MEDIUM (siguiente sprint), LOW (backlog)

---

## DEBT-001: Database Package Runtime Workarounds

**Prioridad:** HIGH (V2)
**Clasificación:** Arquitectura
**Creado:** Junio 2026

### Problema
Para que el deploy funcione, se crearon workarounds:
- `packages/database/src/index.js` — versión JS manual del index.ts
- `packages/database/dist/index.js` — duplicado compilado manualmente
- `apps/api/register-ts-paths.js` — hook de Node.js para resolver .ts → .js

### Solución Definitiva Aplicada
Se eliminaron los `paths` y `rootDir` del tsconfig del API. Ahora NestJS compila usando resolución estándar de Node.js (`node_modules` via pnpm workspace symlinks).

### Limpieza Pendiente
- [ ] Eliminar `apps/api/register-ts-paths.js` (ya no necesario)
- [ ] Eliminar `packages/database/src/index.js` (el .ts es para dev, dist/index.js para prod)
- [ ] Verificar que `packages/database/dist/index.js` se use correctamente
- [ ] Considerar agregar build step al database package (`tsc`) para generar dist automáticamente
- [ ] Agregar `packages/database/dist/` al `.gitignore` y generarlo en CI/CD

### Estado
✅ Corrección aplicada (tsconfig fix). Workarounds ya no son necesarios pero los archivos siguen existiendo.

---

## DEBT-002: `typescript.ignoreBuildErrors: true` en Next.js

**Prioridad:** MEDIUM
**Clasificación:** Calidad de Código
**Creado:** Junio 2026

### Problema
Se agregó `ignoreBuildErrors: true` en `next.config.ts` para que Vercel pueda buildear sin que errores de tipos bloqueen el deploy.

### Impacto
- Errores de TypeScript no se detectan durante el build de producción
- Bugs de tipos pueden llegar a producción sin ser detectados
- Solo afecta Vercel, no el desarrollo local

### Solución Definitiva
- [ ] Corregir TODOS los errores de tipos pendientes
- [ ] Remover `ignoreBuildErrors: true`
- [ ] Agregar CI que corra `pnpm type-check` antes de merge

---

## DEBT-003: Prisma en `dependencies` (no devDependencies)

**Prioridad:** LOW
**Clasificación:** Dependencies
**Creado:** Junio 2026

### Problema
`prisma` CLI fue movido de `devDependencies` a `dependencies` para que esté disponible durante builds de producción donde `NODE_ENV=production`.

### Impacto
- El paquete prisma CLI (~20MB) se incluye en la imagen de producción
- Ligeramente más grande que necesario (solo se necesita durante build, no runtime)

### Solución Definitiva
- [ ] Usar multi-stage Dockerfile: instalar prisma en stage de build, no copiar al stage final
- [ ] O usar `pnpm install --prod` solo para el stage de runtime

---

## DEBT-004: Manual `dist/index.js` en Database Package

**Prioridad:** HIGH (V2)
**Clasificación:** Arquitectura
**Creado:** Junio 2026

### Problema
El archivo `packages/database/dist/index.js` fue creado manualmente (no generado por un build step). Si el source `src/index.ts` cambia, el dist puede quedar desactualizado.

### Solución Definitiva
- [ ] Agregar `tsconfig.build.json` al database package
- [ ] Agregar script `"build": "tsc -p tsconfig.build.json"`
- [ ] Agregar al turbo.json para que se buildee automáticamente
- [ ] Agregar `dist/` al `.gitignore` del database package
- [ ] Dockerfile: `RUN pnpm --filter @community-os/database build` antes de `pnpm --filter @community-os/api build`

---

## DEBT-005: CORS Wildcard en Producción

**Prioridad:** MEDIUM
**Clasificación:** Seguridad
**Creado:** Junio 2026

### Problema
La variable `CORS_ORIGIN=*` permite requests desde cualquier origen. Aceptable para piloto, no para producción real.

### Solución Definitiva
- [ ] Cambiar a `CORS_ORIGIN=https://weboss-beta.vercel.app` (URL exacta del frontend)
- [ ] Agregar lista de orígenes permitidos si hay múltiples frontends

---

## DEBT-006: Secrets en Variables de Entorno

**Prioridad:** MEDIUM
**Clasificación:** Seguridad
**Creado:** Junio 2026

### Problema
Los JWT secrets y ARGON2_PEPPER fueron generados manualmente con strings predecibles para el piloto.

### Solución Definitiva
- [ ] Generar secrets con `openssl rand -base64 64`
- [ ] Rotar secrets post-piloto
- [ ] Rotar password de Neon DB post-piloto
- [ ] Considerar integración con Railway secret management

---

## Resumen

| ID | Descripción | Prioridad | Fase |
|----|-------------|-----------|------|
| DEBT-001 | Database package workarounds | HIGH | V2 |
| DEBT-002 | ignoreBuildErrors en Next.js | MEDIUM | V2 |
| DEBT-003 | Prisma en dependencies | LOW | V2 |
| DEBT-004 | Manual dist/index.js | HIGH | V2 |
| DEBT-005 | CORS wildcard | MEDIUM | Post-piloto |
| DEBT-006 | Secrets predecibles | MEDIUM | Post-piloto |
