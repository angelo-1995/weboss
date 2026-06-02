# 7. Wireframes Textuales — J-PDVE Conexiones

---

## Pantalla: Login

```
┌─────────────────────────────────────────┐
│                                         │
│         [Logo J-PDVE Conexiones]        │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Email                           │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │ Contraseña              [👁]    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   [═══════ Iniciar Sesión ═══════]      │
│                                         │
│   ¿Olvidaste tu contraseña? →           │
│                                         │
│   ─────────────────────────────────     │
│   Powered by J-PDVE Conexiones v1.0     │
│                                         │
└─────────────────────────────────────────┘
```

**Componentes:**
- Logo animado (fade-in al cargar)
- Input email con validación inline
- Input password con toggle visibility
- Botón primario (azul #1565FF)
- Link de recuperación de contraseña
- Footer con versión

**Estados de error:**
- Campo vacío: borde rojo + "Este campo es requerido"
- Credenciales inválidas: toast rojo "Credenciales inválidas"
- Cuenta suspendida: toast warning "Tu cuenta está suspendida"
- Rate limited: toast "Demasiados intentos. Intenta en 15 minutos"

---

## Pantalla: Dashboard Ejecutivo

```
┌───────────────────────────────────────────────────────────┐
│ [☰] J-PDVE Conexiones          [🔔 3] [👤 Juan Pérez ▼] │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  Semana 23 · Jun 2-8, 2026        [◀ Anterior] [▶]       │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 📊 342   │ │ 💰 B/285 │ │ 👥 28    │ │ ✅ 15    │    │
│  │Asistencia│ │ Ofrenda  │ │Visitantes│ │Consolid. │    │
│  │ ↑ +12%   │ │ ↑ +5%   │ │ ↓ -3     │ │ = 0%     │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                           │
│  ┌──────────┐ ┌──────────┐                               │
│  │ 🏠 18    │ │ ⚠️  3    │                               │
│  │ Teams    │ │ Sin      │                               │
│  │ Activos  │ │ Reporte  │                               │
│  └──────────┘ └──────────┘                               │
│                                                           │
│  ─── Tendencia de Asistencia (12 semanas) ───            │
│  ┌─────────────────────────────────────────────┐         │
│  │    ╭─╮                                      │         │
│  │   ╭╯ ╰╮  ╭──╮     ╭─╮                      │         │
│  │  ╭╯    ╰─╯  ╰╮   ╭╯ ╰──╮                   │         │
│  │ ─╯            ╰──╯      ╰──                 │         │
│  │ S1  S2  S3  S4  S5  S6  S7  S8...          │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Alertas Recientes ───                               │
│  ┌─────────────────────────────────────────────┐         │
│  │ ⚠️ E4.1.2 (Luis & Oris) - 2 semanas sin    │         │
│  │    reporte                         [Atender]│         │
│  ├─────────────────────────────────────────────┤         │
│  │ 📉 E5.3 (Carlos & Ana) - Declive de        │         │
│  │    asistencia 3 semanas            [Atender]│         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Componentes:**
- Header: hamburger menu, logo, notification bell con badge, avatar+nombre
- Period selector: flechas de navegación + semana actual
- KPI Cards: 6 cards con icono, valor, label, trend (color verde/rojo/gris)
- Attendance chart: Recharts line chart, 12 semanas
- Alerts panel: lista de alertas con acción rápida

**Estado vacío (primera vez):**
- KPI cards con valor 0 y mensaje "Sin datos esta semana"
- Chart: "Aún no hay suficientes datos para mostrar tendencias"
- Alertas: "No hay alertas activas 🎉"

---

## Pantalla: Personas

```
┌───────────────────────────────────────────────────────────┐
│ [←] Personas                    [+ Nueva Persona]         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔍 [Buscar por nombre...                    ]           │
│                                                           │
│  Filtros: [Stage ▼] [Equipo ▼] [Red ▼]                  │
│                                                           │
│  ─── 156 personas encontradas ───                        │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │ [👤] Carlos Gómez                           │         │
│  │      📍 E4.1 (Juan & María)                 │         │
│  │      🏷️ Consolidado · 📱 +507 6XXX-XXXX    │         │
│  │                            [Ver] [Pipeline]  │         │
│  ├─────────────────────────────────────────────┤         │
│  │ [👤] Ana Rodríguez                          │         │
│  │      📍 E5.2 (Pedro & Lucía)                │         │
│  │      🏷️ Visitante · 📱 +507 6XXX-XXXX      │         │
│  │                            [Ver] [Pipeline]  │         │
│  ├─────────────────────────────────────────────┤         │
│  │ [👤] Miguel Torres                          │         │
│  │      📍 E4.1.1 (Luis & Oris)               │         │
│  │      🏷️ Discipulado · 📱 +507 6XXX-XXXX    │         │
│  │                            [Ver] [Pipeline]  │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  [◀ 1 2 3 ... 16 ▶]                                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Componentes:**
- Search input con debounce 300ms (Meilisearch)
- Filter dropdowns: pipeline stage, equipo, red
- Person cards: avatar, nombre, equipo, stage badge, teléfono, acciones
- Pagination: cursor-based, 10 per page

**Acciones:**
- "Ver": Abre detalle de persona
- "Pipeline": Abre modal para avanzar stage
- "+ Nueva Persona": Abre formulario de registro

**Estado vacío:**
- Sin resultados de búsqueda: "No se encontraron personas con ese criterio"
- Sin personas (nuevo): "Aún no hay personas registradas. Comienza agregando visitantes."

---

## Pantalla: Equipos Ministeriales

```
┌───────────────────────────────────────────────────────────┐
│ [←] Equipos Ministeriales       [+ Nuevo Equipo]         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔍 [Buscar...] [Grid ▦] [Lista ≡] [Mapa 🗺️]           │
│                                                           │
│  Filtros: [Red ▼] [Estado ▼] [Cobertura ▼]              │
│                                                           │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ │
│  │ E4.1           │ │ E4.1.1         │ │ E5.2         │ │
│  │ Juan & María   │ │ Luis & Oris    │ │ Pedro & Lucía│ │
│  │                │ │                │ │              │ │
│  │ 👥 12 personas │ │ 👥 8 personas  │ │ 👥 15 personas│ │
│  │ 📅 Martes 7pm  │ │ 📅 Jueves 7pm │ │ 📅 Miér 7pm │ │
│  │                │ │                │ │              │ │
│  │ ▁▃▅▇█▅▃▁      │ │ ▁▂▃▅▇▇▅▃      │ │ ▃▅▅▃▁▁▃▅    │ │
│  │ Asist. 4 sem   │ │ Asist. 4 sem  │ │ Asist. 4 sem│ │
│  │                │ │                │ │              │ │
│  │[Reporte][+👤]  │ │[Reporte][+👤] │ │[Reporte][+👤]│ │
│  └────────────────┘ └────────────────┘ └──────────────┘ │
│                                                           │
│  ┌────────────────┐ ┌────────────────┐                   │
│  │ E5.3           │ │ E4.2           │                   │
│  │ Carlos & Ana   │ │ Roberto & Sara │                   │
│  │ ⚠️ Sin reporte │ │                │                   │
│  │ 👥 6 personas  │ │ 👥 10 personas │                   │
│  │ 📅 Viernes 7pm │ │ 📅 Sábado 5pm │                   │
│  │                │ │                │                   │
│  │ ▅▃▁___(sin)    │ │ ▃▅▇▇▅▅▃▅      │                   │
│  │                │ │                │                   │
│  │[Reporte][+👤]  │ │[Reporte][+👤] │                   │
│  └────────────────┘ └────────────────┘                   │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Componentes:**
- View toggle: Grid (cards) / Lista (tabla) / Mapa
- Team cards: código, nombre líderes, count personas, día/hora, sparkline 4 semanas
- Quick actions: enviar reporte, agregar persona
- Warning badge: para teams sin reporte reciente

**Estado vacío:**
- Sin teams: "No hay equipos ministeriales asignados. Contacta a tu cobertura."
- Sin resultados: "No se encontraron equipos con ese criterio"

---

## Pantalla: Informe de Célula (Wizard)

```
┌───────────────────────────────────────────────────────────┐
│ [←] Reporte Semanal                                       │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ● ─── ○ ─── ○ ─── ○ ─── ○                              │
│  ID    Asist  Crec   Reun  Resumen                       │
│  Paso 1 de 5 · 20%                                       │
│                                                           │
│  ─── Identificación ───                                  │
│                                                           │
│  Equipo Ministerial                                      │
│  ┌─────────────────────────────────────┐                 │
│  │ E4.1 - Juan & María            [▼] │                 │
│  └─────────────────────────────────────┘                 │
│                                                           │
│  Fecha de Reunión                                        │
│  ┌─────────────────────────────────────┐                 │
│  │ 📅 02/06/2026                       │                 │
│  └─────────────────────────────────────┘                 │
│                                                           │
│  ⚠️ Ya existe un reporte para esta semana.               │
│     Enviado: 01/06/2026. [Ver reporte →]                 │
│                                                           │
│  Nombre Cobertura                                        │
│  ┌─────────────────────────────────────┐                 │
│  │ Pastor Carlos Martínez              │                 │
│  └─────────────────────────────────────┘                 │
│                                                           │
│                                                           │
│           [═══════ Siguiente ═══════]                     │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

**Step 2 - Asistencia (Mobile):**

```
┌───────────────────────────────────────┐
│ [←] Reporte · Asistencia              │
├───────────────────────────────────────┤
│                                       │
│  ○ ─── ● ─── ○ ─── ○ ─── ○          │
│  Paso 2 de 5 · 40%                   │
│                                       │
│  Hombres                              │
│  ┌────┐ ┌──────┐ ┌────┐             │
│  │ −  │ │  05  │ │ +  │             │
│  │    │ │      │ │    │             │
│  └────┘ └──────┘ └────┘             │
│                                       │
│  Mujeres                              │
│  ┌────┐ ┌──────┐ ┌────┐             │
│  │ −  │ │  08  │ │ +  │             │
│  │    │ │      │ │    │             │
│  └────┘ └──────┘ └────┘             │
│                                       │
│  Jóvenes (Hombres)                    │
│  ┌────┐ ┌──────┐ ┌────┐             │
│  │ −  │ │  03  │ │ +  │             │
│  │    │ │      │ │    │             │
│  └────┘ └──────┘ └────┘             │
│                                       │
│  Jóvenes (Mujeres)                    │
│  ┌────┐ ┌──────┐ ┌────┐             │
│  │ −  │ │  02  │ │ +  │             │
│  │    │ │      │ │    │             │
│  └────┘ └──────┘ └────┘             │
│                                       │
│  Niños                                │
│  ┌────┐ ┌──────┐ ┌────┐             │
│  │ −  │ │  04  │ │ +  │             │
│  │    │ │      │ │    │             │
│  └────┘ └──────┘ └────┘             │
│                                       │
│  Total: 22 personas                   │
│                                       │
│  [← Anterior]    [Siguiente →]        │
│                                       │
│  ← Desliza para navegar →             │
│                                       │
└───────────────────────────────────────┘
```

---

## Pantalla: Recursos

```
┌───────────────────────────────────────────────────────────┐
│ [←] Centro de Recursos              [+ Subir Recurso]     │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  🔍 [Buscar recursos...                        ]         │
│                                                           │
│  Categorías: [Todos] [Sermones] [Manuales] [Training]    │
│                                                           │
│  ┌─────────────────────────────────────────────┐         │
│  │ 📄 Sermón: "La Fe que Mueve Montañas"       │         │
│  │    Categoría: Sermones · PDF · 2.3 MB        │         │
│  │    Subido: 01/06/2026 por Pastor General     │         │
│  │                              [⬇ Descargar]   │         │
│  ├─────────────────────────────────────────────┤         │
│  │ 📄 Manual de Líder de Célula v2              │         │
│  │    Categoría: Manuales · PDF · 5.1 MB        │         │
│  │    Subido: 28/05/2026 por Pastor Red         │         │
│  │                              [⬇ Descargar]   │         │
│  ├─────────────────────────────────────────────┤         │
│  │ 📄 Guía de Consolidación                     │         │
│  │    Categoría: Training · PDF · 1.8 MB        │         │
│  │    Subido: 25/05/2026 por Pastor General     │         │
│  │                              [⬇ Descargar]   │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Pantalla: Configuración

```
┌───────────────────────────────────────────────────────────┐
│ [←] Configuración                                         │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ─── Mi Perfil ───                                       │
│  ┌─────────────────────────────────────────────┐         │
│  │ [Avatar]  Juan Pérez                         │         │
│  │           juan@ministerio.com                │         │
│  │           Rol: Pastor de Red                 │         │
│  │                                 [Editar]     │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Seguridad ───                                       │
│  ┌─────────────────────────────────────────────┐         │
│  │ Cambiar contraseña                      [→] │         │
│  │ Sesiones activas (2)                    [→] │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Notificaciones ───                                  │
│  ┌─────────────────────────────────────────────┐         │
│  │ Reportes pendientes          [●──────────]  │         │
│  │ Nuevos recursos              [●──────────]  │         │
│  │ Alertas pastorales           [●──────────]  │         │
│  │ Comentarios en reportes      [──────────●]  │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Administración (solo admin) ───                     │
│  ┌─────────────────────────────────────────────┐         │
│  │ Gestión de usuarios                     [→] │         │
│  │ Pipeline pastoral                       [→] │         │
│  │ Reglas de reportes                      [→] │         │
│  │ Redes ministeriales                     [→] │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
│  ─── Sistema ───                                         │
│  ┌─────────────────────────────────────────────┐         │
│  │ Versión: 1.0.0                               │         │
│  │ Iglesia: Ministerio PDVE                     │         │
│  │                                              │         │
│  │ [═══════ Cerrar Sesión ═══════]              │         │
│  └─────────────────────────────────────────────┘         │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## Pantalla: Post-Submission (Celebración)

```
┌───────────────────────────────────────┐
│                                       │
│          🎉 🎊 ✨ 🎉 🎊              │
│                                       │
│      ┌─────────────────────┐         │
│      │                     │         │
│      │        ✓            │         │
│      │                     │         │
│      │  ¡Reporte Enviado!  │         │
│      │                     │         │
│      └─────────────────────┘         │
│                                       │
│  ─── Esta Semana vs Anterior ───     │
│                                       │
│     22 personas    ↑ +3              │
│     (anterior: 19)                    │
│                                       │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │▁▃▅▇█    │ │ 🌱 9%   │ │ 🔥 5   │ │
│  │Asistencia│ │Crecim.  │ │Semanas │ │
│  │ 4 sem   │ │         │ │Seguidas│ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                       │
│  [Ver Historial]  [Cerrar]           │
│                                       │
└───────────────────────────────────────┘
```

---

## Navegación Mobile (Bottom Nav)

```
┌───────────────────────────────────────┐
│                                       │
│         (contenido de página)         │
│                                       │
├───────────────────────────────────────┤
│  🏠      📊      ➕      📂      ⚙️  │
│ Inicio  Dashboard Report Recursos Config│
└───────────────────────────────────────┘
```

**Roles y navegación:**
- MINISTRY_TEAM: Inicio, Mi Equipo, + Reporte, Recursos, Config
- COBERTURA: Inicio, Dashboard, Equipos, Recursos, Config
- PASTOR_RED+: Inicio, Dashboard, Equipos, Recursos, Config (con más opciones)
