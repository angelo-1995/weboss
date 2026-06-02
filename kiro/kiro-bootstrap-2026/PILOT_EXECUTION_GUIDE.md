# PILOT_EXECUTION_GUIDE.md — Guía de Ejecución del Piloto Oficial

> **Duración:** 2 semanas
> **Red:** Jóvenes
> **Prerequisito:** Piloto 0 (Smoke Test) completado con resultado "Go"

---

## 1. Checklist de Inicio

### 3 días antes del piloto

- [ ] Piloto 0 completado exitosamente (todos los criterios Go cumplidos)
- [ ] Datos reales cargados y validados (equipos, personas, jerarquía)
- [ ] Todos los líderes piloto tienen cuenta creada
- [ ] Todos pueden hacer login exitosamente
- [ ] Grupo WhatsApp "Piloto J-PDVE" creado con todos los participantes
- [ ] Video tutorial grabado (3 min: login + reporte)
- [ ] PDF guía rápida listo (1 página)
- [ ] Sesión de capacitación agendada (15 min, presencial o virtual)
- [ ] Admin disponible para soporte en horario definido

### Día 0 (Viernes/Sábado antes del primer domingo)

- [ ] Enviar mensaje al grupo: "¡Mañana usamos J-PDVE por primera vez!"
- [ ] Compartir video tutorial en el grupo
- [ ] Compartir PDF guía rápida
- [ ] Confirmar que cada líder tiene la app instalada como PWA (o sabe la URL)
- [ ] Verificar que el sistema está corriendo sin errores
- [ ] Verificar que pipeline stages están correctos
- [ ] Backup de base de datos

---

## 2. Capacitación de Líderes

### Formato
- **Duración:** 15 minutos
- **Modalidad:** Presencial (ideal) o videollamada
- **Asistentes:** Todos los líderes + coberturas del piloto

### Agenda

| Min | Tema | Demostración |
|-----|------|-------------|
| 0-1 | Bienvenida | "Hoy comenzamos a usar J-PDVE Conexiones" |
| 1-3 | ¿Qué es? | "Reemplaza el papel. Mismo contenido, más beneficios." |
| 3-6 | Demo Login | Abrir app → email → contraseña → dashboard |
| 6-10 | Demo Reporte | Wizard paso a paso en celular (en vivo) |
| 10-12 | Autosave | "Si cierras la app, no pierdes datos" |
| 12-13 | Períodos | "Domingo = normal, Lun-Mié = tardío, Jue+ = cerrado" |
| 13-14 | Soporte | "Cualquier duda → grupo de WhatsApp" |
| 14-15 | Preguntas | Resolver dudas |

### Mensajes Clave (repetir)

> "Es más rápido que el papel — menos de 3 minutos."
> "Se guarda solo — si te llaman, no pierdes nada."
> "Puedes ver tu progreso inmediatamente."
> "Si tienes dudas, escribe al grupo y te ayudamos al instante."

### NO decir

- "Es una prueba" (genera inseguridad)
- "Si no funciona volvemos al papel" (quita urgencia)
- "Es complicado" (sesga la percepción)

### SÍ decir

- "Esto es el futuro de cómo reportamos"
- "Ustedes son los primeros en usarlo"
- "Su feedback es valiosísimo"

---

## 3. Materiales Requeridos

| Material | Formato | Responsable | Estado |
|----------|---------|-------------|--------|
| Video tutorial "Cómo enviar tu reporte" | Video 3 min (screen recording celular) | Admin | [ ] Pendiente |
| Guía rápida | PDF 1 página (visual, poco texto) | Admin | [ ] Pendiente |
| Credenciales individuales | Mensaje directo a cada líder | Admin | [ ] Pendiente |
| Grupo WhatsApp | Grupo con todos los participantes | Admin | [ ] Pendiente |
| Formulario de feedback | Google Forms / Typeform | Admin | [ ] Pendiente |

### Contenido del PDF Guía Rápida

```
┌─────────────────────────────────────────┐
│ J-PDVE CONEXIONES — Guía Rápida        │
│                                         │
│ 1. Abre: [URL de la app]               │
│ 2. Ingresa tu email y contraseña        │
│ 3. Toca "Reportes" en la barra inferior │
│ 4. Sigue los 4 pasos del reporte       │
│ 5. Toca "Enviar Reporte"               │
│                                         │
│ ¿Dudas? Escribe al grupo de WhatsApp   │
│                                         │
│ ⏰ Recuerda:                            │
│ Domingo = Envío normal                  │
│ Lunes-Miércoles = Envío tardío          │
│ Jueves+ = Cerrado                       │
└─────────────────────────────────────────┘
```

---

## 4. Soporte Operativo

### Horario de Soporte

| Día | Horario | Canal | Nivel |
|-----|---------|-------|-------|
| Domingo | 6 PM - 10 PM | WhatsApp grupo | Activo (reportes se envían aquí) |
| Lun-Mié | 8 AM - 9 PM | WhatsApp grupo | Reactivo (período tardío) |
| Jue-Vie | 8 AM - 6 PM | WhatsApp grupo | Solo bugs críticos |
| Sábado | — | — | Sin soporte |

### Escalación

| Nivel | Tipo | Respuesta | Acción |
|-------|------|-----------|--------|
| 1 | Duda de uso | < 15 min | Responder en grupo |
| 2 | Bug no-bloqueante | < 1 hora | Registrar, resolver en siguiente sesión |
| 3 | Bug bloqueante (no puede reportar) | < 30 min | Hotfix inmediato |
| 4 | Sistema caído | < 15 min | Reiniciar servicios |

### Frases de Soporte Útiles

- "¿Puedes enviarme un screenshot de lo que ves?"
- "¿En qué paso del wizard estás?"
- "¿Estás usando celular o computadora?"
- "Intenta cerrar la app y volver a abrirla"
- "Verifica que tengas buena señal de internet"

---

## 5. Monitoreo Diario

### Dashboard del Admin (revisar diariamente)

| Qué revisar | Dónde | Frecuencia |
|------------|-------|-----------|
| Reportes enviados hoy | /dashboard → KPI Cumplimiento | Diario (domingo-miércoles) |
| Alertas generadas | /dashboard → Panel Alertas | Diario |
| Errores en logs | Terminal del servidor | Diario |
| Usuarios activos | Audit log → logins | Diario |
| Drafts abandonados | /dashboard/drafts (admin) | Cada 2 días |

### Señales de Alerta (intervenir)

| Señal | Acción |
|-------|--------|
| Líder no logra enviar en 2 intentos | Contactar directamente, ofrecer ayuda 1:1 |
| 0 reportes al lunes medio día | Recordatorio en grupo: "¿Cómo les fue ayer?" |
| Múltiples errores 500 en logs | Investigar y hotfixear |
| Líder reporta que es "muy complicado" | Sesión 1:1 de 5 minutos para destrabar |

---

## 6. Gestión de Incidentes

### Registro de Incidentes

| # | Fecha | Reportado por | Descripción | Severidad | Estado | Resolución |
|---|-------|---------------|-------------|-----------|--------|------------|
| 1 | | | | | | |
| 2 | | | | | | |

### Severidades

| Nivel | Definición | SLA |
|-------|-----------|-----|
| 🔴 Crítico | No se puede enviar reporte | Fix en < 2h |
| 🟠 Alto | Feature no funciona pero hay workaround | Fix en < 24h |
| 🟡 Medio | UI confusa o comportamiento inesperado | Fix en próximo sprint |
| 🟢 Bajo | Cosmético o sugerencia | Backlog |

---

## 7. Recolección de Feedback

### Métodos

| Método | Momento | Formato |
|--------|---------|---------|
| Observación directa | Día 1 (capacitación) | Notas del admin |
| WhatsApp informal | Toda la semana 1 | Mensajes del grupo |
| Check-in verbal | Fin semana 1 | "¿Cómo les fue? ¿Algo difícil?" |
| **Encuesta formal** | Viernes semana 2 | Google Forms (16 preguntas) |
| Sesión de cierre | Sábado semana 2 | Reunión 30 min (presencial o virtual) |

### Preguntas Clave del Formulario

Las más importantes para decisiones:

1. "Del 1 al 5, ¿qué tan fácil fue?" → Métrica de usabilidad
2. "¿Tiempo de reporte comparado con papel?" → Eficiencia
3. "Si elimináramos el sistema, ¿volverías al papel?" → **Pregunta decisiva**
4. "¿Lo recomendarías?" → NPS
5. "¿Qué fue lo más difícil?" → Priorización de mejoras

---

## 8. Cierre del Piloto

### Sesión de Cierre (30 minutos)

| Min | Actividad |
|-----|-----------|
| 0-5 | Agradecer participación |
| 5-10 | Compartir resultados: "Se enviaron X reportes, Y personas registradas" |
| 10-15 | ¿Qué funcionó bien? (ronda rápida) |
| 15-20 | ¿Qué mejorarían? (ronda rápida) |
| 20-25 | ¿Seguimos usando el sistema? (decisión grupal) |
| 25-30 | Próximos pasos: "Ahora se expande a toda la Red de Jóvenes" |

### Entregables Post-Cierre

- [ ] Documento de resultados del piloto (métricas + feedback)
- [ ] Lista de bugs/mejoras priorizadas
- [ ] Decisión formal: Go/No-Go para Fase 3
- [ ] Timeline de expansión a Red de Jóvenes completa

---

## 9. Lecciones Aprendidas (Template)

Completar al final del piloto:

### ¿Qué funcionó bien?
1.
2.
3.

### ¿Qué no funcionó?
1.
2.
3.

### ¿Qué ajustaríamos para la próxima fase?
1.
2.
3.

### ¿Qué feedback inesperado recibimos?
1.
2.
3.

### Decisión
- [ ] **Go** → Expandir a toda la Red de Jóvenes
- [ ] **No-Go** → Ajustar y repetir piloto
- [ ] **Pivotar** → Cambiar enfoque significativamente

---

## 10. Métricas Finales a Reportar

| Métrica | Objetivo | Resultado |
|---------|----------|-----------|
| Reportes enviados | ≥ 6 | _____ |
| Reportes dentro del período | ≥ 80% | _____% |
| Tiempo promedio de reporte | ≤ 3 min | _____ min |
| Login sin ayuda | ≥ 60% | _____% |
| Satisfacción (1-5) | ≥ 3.5 | _____ |
| Prefiere app vs papel | ≥ 60% | _____% |
| Recomendaría a otros | ≥ 60% | _____% |
| Bugs críticos | 0 | _____ |
