# SYSTEM_REVIEW_GUIDE.md — Guía de Revisión del Sistema

> **Para:** Product Owner
> **Objetivo:** Navegar todo J-PDVE Conexiones como Pastor General y validar visual + funcionalmente.
> **Duración estimada:** 30-45 minutos

---

## Cómo Levantar el Sistema

```bash
# 1. Levantar infraestructura (PostgreSQL, Redis, Meilisearch)
cd kiro/kiro-bootstrap-2026
pnpm docker:up

# 2. Resetear y cargar datos demo
pnpm db:migrate
pnpm db:seed

# 3. Levantar backend (puerto 4000)
pnpm --filter @community-os/api dev

# 4. En otra terminal: Levantar frontend (puerto 3000)
pnpm --filter @community-os/web dev

# 5. Abrir: http://localhost:3000/login
```

---

## Credenciales

| Rol | Email | Password | Qué puede ver |
|-----|-------|----------|--------------|
| 🔑 **Pastor General** | `admin@jpdve.local` | `ChangeMe123!` | TODO |
| 🔑 **Pastor Jóvenes** | `pastor.jovenes@jpdve.local` | `ChangeMe123!` | Red E5 completa |
| 🔑 **Cobertura E5** | `cobertura.e5@jpdve.local` | `ChangeMe123!` | Equipos E5.1, E5.2, E5.3 |
| 🔑 **Líder E5.1** | `lider.e51@jpdve.local` | `ChangeMe123!` | Solo su equipo E5.1 |
| 🔑 **Líder E5.2** | `lider.e52@jpdve.local` | `ChangeMe123!` | Solo su equipo E5.2 |
| 🔑 **Líder E5.3** | `lider.e53@jpdve.local` | `ChangeMe123!` | Solo su equipo E5.3 |

**Recomendación:** Empieza como `admin@jpdve.local` (Pastor General) para ver todo. Luego prueba como `lider.e51@jpdve.local` para ver la experiencia del líder.

---

## Ruta de Revisión Recomendada

### Fase 1: Primera Impresión (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 1 | Abrir `/login` | ¿Se siente J-PDVE? ¿Branding correcto? ¿Colores, logo, cita bíblica? | ☐ |
| 2 | Login como `admin@jpdve.local` | ¿Redirect rápido? ¿Sin errores? | ☐ |
| 3 | Primera vista del Dashboard | ¿KPIs con datos? ¿No está vacío? ¿Alertas visibles? | ☐ |
| 4 | Observar sidebar | ¿Dice "J-PDVE Conexiones"? ¿Menú organizado? | ☐ |

### Fase 2: Dashboard (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 5 | Revisar KPI cards | ¿6 cards con valores reales? ¿Trends con flechas? | ☐ |
| 6 | Revisar gráfica de tendencia | ¿Muestra datos de las últimas semanas? | ☐ |
| 7 | Revisar panel de Alertas | ¿2 alertas visibles? ¿E5.3 sin reporte + zero visitors? | ☐ |
| 8 | Click "Atender" en una alerta | ¿Desaparece? ¿Se marca como atendida? | ☐ |
| 9 | Revisar Pipeline Espiritual | ¿4 cards con conteos? (Ganados, Consolidados, etc.) | ☐ |

### Fase 3: Personas (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 10 | Navegar a "Personas" (sidebar) | ¿Lista con 22 personas? ¿Badges de stage coloreados? | ☐ |
| 11 | Buscar "Carlos" | ¿Aparece Carlos Gómez? ¿Debounce funciona? | ☐ |
| 12 | Click en una persona | ¿Detalle con info completa? ¿Avatar con iniciales? | ☐ |
| 13 | Tab "Timeline Espiritual" | ¿Muestra mensaje "Sin historial" o entrada inicial? | ☐ |
| 14 | Tab "Información" | ¿Datos personales + ministeriales correctos? | ☐ |

### Fase 4: Equipos Ministeriales (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 15 | Navegar a "Equipos" (sidebar) | ¿Lista de grupos? ¿E5.1, E5.2, E5.3 visibles? | ☐ |
| 16 | Click en equipo E5.1 | ¿Detalle con miembros? ¿Líder asignado? | ☐ |
| 17 | Verificar código ministerial | ¿Se muestra "E5.1"? | ☐ |
| 18 | Verificar ubicación | ¿Barriada, calle, casa#? | ☐ |

### Fase 5: Reportes (10 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 19 | Navegar a "Reportes" | ¿Wizard visible? ¿Banner de período? | ☐ |
| 20 | Seleccionar equipo E5.1 del dropdown | ¿Auto-fill de líder, código, cobertura? | ☐ |
| 21 | Seleccionar fecha (domingo pasado) | ¿Period status correcto? ¿Banner verde/amarillo? | ☐ |
| 22 | Avanzar a Step 2 (Asistencia) | ¿Steppers ± funcionan? ¿Total se calcula? | ☐ |
| 23 | Avanzar a Step 3 (Reunión) | ¿Campos de tema, ofrenda, ubicación? | ☐ |
| 24 | Avanzar a Step 4 (Resumen) | ¿Resumen legible? ¿Botones "Editar" por sección? | ☐ |
| 25 | Click "Editar" en Asistencia | ¿Regresa al step 2 sin perder datos? | ☐ |
| 26 | Volver al Resumen | ¿Datos preservados? | ☐ |
| 27 | **NO enviar** (salir de la página) | ¿Autosave guarda el borrador? | ☐ |
| 28 | Volver a /reports | ¿Toast "Borrador restaurado"? ¿Datos recuperados? | ☐ |

### Fase 6: Experiencia Móvil (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 29 | Resize browser a 375px width (móvil) | ¿Bottom nav aparece? ¿Sidebar desaparece? | ☐ |
| 30 | Navegar con bottom nav | ¿5 iconos: Inicio, Personas, Reportes, Recursos, Perfil? | ☐ |
| 31 | Wizard en móvil | ¿Steppers usables? ¿No hay overflow? | ☐ |
| 32 | KPIs en móvil | ¿Grid 2 columnas? ¿Legibles? | ☐ |
| 33 | Resize a 768px (tablet) | ¿Layout intermedio correcto? | ☐ |

### Fase 7: Experiencia como Líder (5 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 34 | Logout | ¿Redirect a login? | ☐ |
| 35 | Login como `lider.e51@jpdve.local` | ¿Dashboard diferente (líder, no admin)? | ☐ |
| 36 | ¿Puede ver equipos de otro líder? | **NO debería** (solo su equipo E5.1) | ☐ |
| 37 | Crear reporte como líder | ¿Flujo completo funciona? | ☐ |
| 38 | Ver personas de su equipo | ¿Solo las de E5.1? | ☐ |

### Fase 8: Configuración (3 min)

| # | Acción | Qué observar | Checklist |
|---|--------|-------------|:---------:|
| 39 | Navegar a Settings | ¿Perfil visible? ¿Opciones de seguridad? | ☐ |
| 40 | Revisar Redes (/networks) | ¿6 redes visibles? (E1-E6) | ☐ |
| 41 | Revisar Pipeline (/pipeline) | ¿Vista del funnel? | ☐ |
| 42 | Revisar Organigrama | ¿Árbol jerárquico visible? | ☐ |

---

## Datos Cargados en el Demo

| Entidad | Cantidad | Distribución |
|---------|----------|-------------|
| Redes | 6 | E1 Blanca, E2 Verde, E3 Roja, E4 Rosada, E5 Naranja, E6 Roja II |
| Equipos | 3 | E5.1 (Angelo), E5.2 (Marcos), E5.3 (Laura) |
| Usuarios | 6 | 1 Pastor Gral + 1 Pastor Red + 1 Cobertura + 3 Líderes |
| Personas | 22 | Distribuidas: Visitante(5), Consolidado(4), Academia(5), Servidor(3), Líder Pot.(2), otros(3) |
| Reportes | ~9 | 4 semanas: E5.1 (4), E5.2 (3, faltó sem.2), E5.3 (2, faltó sem.1-2) |
| Alertas | 2 | MISSING_REPORT (E5.3) + ZERO_VISITORS (E5.3) |
| Pipeline Stages | 9 | Visitante → Cobertura (completo) |

---

## Formato de Feedback

Para cada item del checklist usar:

| Símbolo | Significado |
|---------|------------|
| ✅ | Funciona correctamente |
| 🔧 | Funciona pero se puede mejorar (indicar cómo) |
| ❌ | Error encontrado (describir) |
| 💡 | Sugerencia nueva |

### Template de Notas

```
## Fase [N]: [Nombre]

### ✅ Lo que funciona
- 

### 🔧 Mejoras sugeridas
- 

### ❌ Errores encontrados
- 

### 💡 Ideas nuevas
- 
```

---

## Al Finalizar la Revisión

Responder estas preguntas:

1. **¿El sistema se siente como J-PDVE Conexiones?** (Sí/No/Parcial)
2. **¿Un líder de célula podría usar esto sin mucha ayuda?** (Sí/No)
3. **¿Listo para Piloto 0?** (Sí/No/Necesita ajustes primero)
4. **Top 3 mejoras prioritarias antes del piloto:**
   - 1.
   - 2.
   - 3.
5. **¿Algo que bloquee completamente el piloto?** (Sí: describir / No)
