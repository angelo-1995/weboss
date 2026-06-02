# REVIEW_TRACKER.md — Seguimiento de Hallazgos

> **Fase:** Revisión Product Owner + Piloto 0
> **Uso:** Registrar todo hallazgo durante la navegación del sistema
> **Regla:** No implementar fixes hasta priorizar. Primero documentar, luego decidir.

---

## P0 — Bloqueadores (impiden usar el sistema)

| # | Pantalla | Descripción | Estado | Responsable |
|---|----------|-------------|--------|-------------|
| | | | | |

---

## P1 — Correcciones Importantes (afectan el flujo principal)

| # | Pantalla | Descripción | Estado | Responsable |
|---|----------|-------------|--------|-------------|
| | | | | |

---

## P2 — Mejoras UX (no bloquean pero impactan percepción)

| # | Pantalla | Descripción | Estado | Responsable |
|---|----------|-------------|--------|-------------|
| | | | | |

---

## P3 — Ideas Futuras (backlog post-piloto)

| # | Pantalla | Descripción | Estado | Responsable |
|---|----------|-------------|--------|-------------|
| | | | | |

---

## Cómo Usar Este Documento

### Agregar un hallazgo

Copiar esta plantilla en la sección correspondiente:

```
| [#] | [Pantalla] | [Descripción del problema o mejora] | Pendiente | [Nombre] |
```

### Estados posibles

| Estado | Significado |
|--------|------------|
| Pendiente | Registrado, sin acción |
| En revisión | Evaluando solución |
| En progreso | Fix en desarrollo |
| Resuelto | Fix aplicado y verificado |
| Descartado | No se implementará (justificado) |
| Post-piloto | Se abordará después de la validación |

### Severidades

| Nivel | Criterio |
|-------|----------|
| **P0** | El usuario NO puede completar la acción. Sistema inutilizable. |
| **P1** | El flujo funciona pero con fricción significativa o error visual importante. |
| **P2** | Todo funciona, pero la experiencia se puede mejorar notablemente. |
| **P3** | Sugerencia, idea nueva, o feature que no existe aún. |

---

## Resumen de Revisión

| Severidad | Total | Resueltos | Pendientes |
|-----------|:-----:|:---------:|:----------:|
| P0 Bloqueadores | 0 | 0 | 0 |
| P1 Correcciones | 0 | 0 | 0 |
| P2 Mejoras UX | 0 | 0 | 0 |
| P3 Ideas | 0 | 0 | 0 |

**Última actualización:** _______________

---

## Criterios Go/No-Go basados en hallazgos

| Condición | Go para Piloto 0 |
|-----------|:-----------------:|
| 0 items P0 abiertos | ✅ Requerido |
| ≤ 3 items P1 abiertos | ✅ Requerido |
| Items P2 documentados (no necesitan fix) | ✅ OK |
| Items P3 documentados (backlog) | ✅ OK |
