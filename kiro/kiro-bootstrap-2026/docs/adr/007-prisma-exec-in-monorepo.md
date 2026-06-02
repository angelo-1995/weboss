# ADR-007: Use `pnpm exec` for Prisma CLI in Monorepo Scripts

**Estado:** Aprobado
**Fecha:** 2026-06-02
**Contexto:** Deploy a Railway falló repetidamente por `prisma: Permission denied`

---

## Causa Raíz Exacta

### El síntoma
```
> prisma generate
sh: 1: prisma: Permission denied
```

### ¿Por qué fallaba `prisma generate` (bare command)?

En un monorepo pnpm con workspaces, cuando un script de package.json dice `"db:generate": "prisma generate"`, pnpm resuelve el binario buscando en:

1. `node_modules/.bin/prisma` del workspace package (`packages/database/node_modules/.bin/`)
2. El binario hoisted en root `node_modules/.bin/prisma`

**El problema:** En entornos Docker/CI con `NODE_ENV=production`:
- pnpm con `--prod` o cuando `NODE_ENV=production` **no instala devDependencies**
- Incluso cuando `prisma` se movió a `dependencies`, el **build cache de Railway** conservaba una imagen anterior donde no existía
- El symlink `node_modules/.bin/prisma` apuntaba a un binario que:
  - No existía (si no se instaló)
  - O existía pero sin permisos de ejecución (`chmod +x`) — común cuando se cachean artifacts de Windows en Linux

### ¿Por qué `npx prisma generate` SÍ funciona?

`npx` no depende del symlink en `.bin/`. En su lugar:
1. Busca el paquete en `node_modules/prisma/`
2. Lee el campo `"bin"` del `package.json` de prisma
3. Ejecuta el archivo directamente con Node.js: `node node_modules/prisma/build/index.js`
4. No necesita permisos de ejecución del archivo porque Node.js lo interpreta

### ¿Por qué `pnpm exec prisma generate` SÍ funciona?

`pnpm exec` es la forma oficial de ejecutar binarios en un workspace pnpm:
1. Resuelve el binario correctamente incluso en monorepos hoisted
2. Maneja permisos internamente
3. No depende del estado del symlink en `.bin/`
4. Es la recomendación oficial de pnpm para CI/CD

---

## Decisión

Cambiar **todos** los scripts de `packages/database/package.json` de:
```json
"prisma generate"  →  "pnpm exec prisma generate"
"prisma migrate dev"  →  "pnpm exec prisma migrate dev"
"prisma studio"  →  "pnpm exec prisma studio"
```

---

## Impacto

### En desarrollo local
- **Ninguno.** `pnpm exec` funciona idénticamente a la invocación directa.
- Los developers siguen usando `pnpm db:generate`, `pnpm db:migrate` sin cambios.

### En CI/CD (Railway, GitHub Actions)
- **Positivo.** El build ya no depende del estado del symlink.
- `pnpm --filter @community-os/database db:generate` ahora funciona en cualquier entorno.

### En Docker
- **Positivo.** No importa si `NODE_ENV=production` o no durante el build. `pnpm exec` encuentra el binario correctamente.

---

## Alternativas consideradas

| Alternativa | Problema |
|------------|----------|
| `prisma generate` (bare) | Depende del symlink en `.bin/` — falla con cache corrupto o permisos de Windows→Linux |
| `npx prisma generate` | Funciona pero es más lento (verifica registry, descarga si no existe) y no es idiomático para pnpm |
| `./node_modules/.bin/prisma generate` | Hardcodea path, no portable entre hoisted/non-hoisted |
| **`pnpm exec prisma generate`** ✅ | Forma oficial pnpm, portable, maneja permisos, funciona en CI/CD |

---

## Referencias
- [pnpm exec docs](https://pnpm.io/cli/exec)
- Railway build logs: múltiples fallos con "Permission denied" (Junio 2026)
- Prisma issue: binarios sin permisos en cross-platform builds
