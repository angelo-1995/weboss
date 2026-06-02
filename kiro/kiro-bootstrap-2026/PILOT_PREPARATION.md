# PILOT_PREPARATION.md — Preparación del Piloto J-PDVE Conexiones

> **Fecha:** Junio 2026
> **Duración:** 2 semanas (2 ciclos de reporte dominical)
> **Objetivo:** Validar el flujo completo Líder → Reporte → Cobertura → Dashboard con usuarios reales

---

## 1. Usuarios Piloto

### Grupo Recomendado (5-8 personas)

| # | Rol | Perfil Ideal | Acceso |
|---|-----|-------------|--------|
| 1 | **Pastor/Admin** | Pastor General o de Red que revisará KPIs y alertas | ADMIN |
| 2 | **Cobertura 1** | Líder que supervisa 2-3 equipos | LEADER |
| 3 | **Líder 1** | Líder de célula activo, con smartphone | LEADER |
| 4 | **Líder 2** | Líder de célula activo, preferiblemente joven | LEADER |
| 5 | **Líder 3** | Líder que reporta normalmente en papel | LEADER |
| 6 | **Co-líder** (opcional) | Co-líder para validar permisos compartidos | LEADER |
| 7 | **Observador** (opcional) | Persona técnica que documente feedback | ADMIN |

### Datos de Creación de Cuentas

Para cada usuario crear:
```
Email: [nombre]@jpdve.local (o email real)
Password temporal: Piloto2026!
Rol: LEADER o ADMIN según tabla
Campus: sede-central
```

**IMPORTANTE:** Después del primer login, instruir cambiar contraseña.

---

## 2. Equipos Piloto

### Equipos a Crear en el Sistema

| # | Nombre | Código | Líder | Día | Red |
|---|--------|--------|-------|-----|-----|
| 1 | [Nombre real del equipo 1] | E_._ | Líder 1 | [Día reunión] | [Red] |
| 2 | [Nombre real del equipo 2] | E_._ | Líder 2 | [Día reunión] | [Red] |
| 3 | [Nombre real del equipo 3] | E_._ | Líder 3 | [Día reunión] | [Red] |

**Datos necesarios por equipo:**
- Nombre (ej: "Luis & Oris")
- Código ministerial (ej: E4.1)
- Líder y co-líder
- Día y hora de reunión
- Dirección/ubicación
- Red a la que pertenece

---

## 3. Datos Iniciales a Cargar

### Antes del día 1 del piloto:

| Dato | Cantidad | Responsable | Método |
|------|----------|-------------|--------|
| Campus/Iglesia | 1 (ya existe: sede-central) | Admin técnico | Seed |
| Redes ministeriales | 2-3 redes reales | Admin | UI o seed |
| Pipeline stages | 9 (ya cargados via seed) | Automático | Seed |
| Usuarios piloto | 5-8 | Admin | UI (/users → crear) |
| Equipos ministeriales | 3-4 | Admin | UI (/groups → crear) |
| Personas de prueba | 5-10 por equipo (opcional) | Líderes | UI (/personas → crear) |

### Seed del Pipeline (ya implementado):
```
1. Visitante
2. Consolidado
3. Academia Nivel 1
4. Academia Nivel 2
5. Academia Nivel 3
6. Servidor
7. Líder Potencial
8. Líder
9. Cobertura
```

---

## 4. Guía de Capacitación (15 minutos)

### Agenda de Capacitación

| Min | Tema | Contenido |
|-----|------|-----------|
| 0-2 | Bienvenida | "Esto es J-PDVE Conexiones, nuestra plataforma ministerial" |
| 2-4 | Login | Mostrar: abrir app → email → contraseña → dashboard |
| 4-7 | Reporte | Demo: crear reporte → 4 pasos → enviar. Mostrar autosave. |
| 7-9 | Period locking | Explicar: domingo=normal, lun-mié=tardío, jue+=cerrado |
| 9-11 | Personas | Mostrar: crear persona → asignar equipo → ver timeline |
| 11-13 | Dashboard | Mostrar: KPIs → alertas → qué significan |
| 13-15 | Preguntas | Resolver dudas, mostrar soporte |

### Materiales a Preparar

- [ ] Video de 3 minutos: "Cómo enviar tu reporte" (screen recording)
- [ ] PDF de 1 página: Login + Reporte en 5 pasos (con capturas)
- [ ] Grupo de WhatsApp: "Piloto J-PDVE Conexiones" para soporte rápido

### Mensajes Clave para Líderes

> "Tu reporte ahora es digital. Mismo contenido que el papel, pero con:
> - Autosave (nunca pierdes datos)
> - Acceso desde el celular
> - Dashboard para ver tu progreso
> - Alertas si se te olvida reportar"

---

## 5. Formulario de Retroalimentación

### Encuesta Post-Piloto (Google Forms / Typeform)

**Sección 1: Experiencia General**
1. Del 1 al 5, ¿qué tan fácil fue usar J-PDVE Conexiones? (1=muy difícil, 5=muy fácil)
2. Del 1 al 5, ¿qué tan rápido pudiste enviar tu reporte comparado con el papel?
3. ¿Pudiste completar el reporte sin ayuda? (Sí/No/Necesité ayuda parcial)

**Sección 2: Reporte**
4. ¿El wizard de 4 pasos te pareció claro? (Sí/No)
5. ¿Entendiste el indicador de período (abierto/tardío/cerrado)? (Sí/No)
6. ¿El autosave te dio confianza de que no perderías datos? (Sí/No/No lo noté)
7. ¿Usaste el sistema desde celular o computadora? (Celular/Computadora/Ambos)

**Sección 3: Dashboard**
8. ¿Las métricas del dashboard te parecen útiles? (Sí/No/Algunas)
9. ¿Las alertas te ayudaron a saber qué faltaba? (Sí/No/No aplica)

**Sección 4: Personas**
10. ¿Registraste personas (visitantes) en el sistema? (Sí/No)
11. Si sí, ¿fue fácil? (Sí/No)

**Sección 5: Abierta**
12. ¿Qué te gustó más?
13. ¿Qué fue lo más difícil o confuso?
14. ¿Qué le agregarías?
15. ¿Recomendarías esta herramienta a otros líderes? (Sí/No/Tal vez)

---

## 6. Métricas de Éxito del Piloto

### Métricas Cuantitativas (medir al final de 2 semanas)

| Métrica | Objetivo Mínimo | Objetivo Ideal |
|---------|:--------------:|:--------------:|
| Reportes enviados digitalmente | ≥ 4 (2 por equipo × 2 semanas) | 6+ |
| Reportes dentro del período (dom-mié) | ≥ 80% | 100% |
| Usuarios que lograron login sin ayuda | ≥ 60% | 90% |
| Personas registradas en el sistema | ≥ 10 | 30+ |
| NPS (pregunta 15 del formulario) | ≥ 60% "Sí" | 80%+ |
| Errores/bugs reportados | ≤ 5 críticos | 0 críticos |
| Satisfacción promedio (pregunta 1) | ≥ 3.5/5 | 4.0+ |

### Métricas Cualitativas

| Señal de Éxito | Indicador |
|---------------|-----------|
| Adopción natural | Líderes envían sin recordatorio |
| Abandono del papel | Dejan de usar formulario físico |
| Exploración | Usan funciones no enseñadas (personas, timeline) |
| Recomendación | Preguntan "¿cuándo lo usan todos?" |

### Señales de Fracaso (abortar o pivotar)

| Señal | Acción |
|-------|--------|
| Nadie logra enviar reporte sin ayuda | Simplificar UX, agregar onboarding |
| Confusión constante con Period Locking | Hacer el banner más explícito o relajar regla |
| "Es más lento que el papel" | Reducir pasos del wizard |
| Bugs que impiden enviar | Hotfix inmediato |

---

## 7. Plan de Soporte Durante 2 Semanas

### Semana 1: Acompañamiento Activo

| Día | Acción |
|-----|--------|
| Lunes (pre) | Capacitación 15 min + crear cuentas |
| Domingo | Recordar: "Hoy es día de reporte, usa J-PDVE" |
| Lunes | Check: "¿Pudieron enviar? ¿Problemas?" |
| Martes | Resolver dudas vía WhatsApp |
| Miércoles | Última oportunidad de envío (período tardío) |
| Jueves | Revisar: ¿cuántos enviaron? Alertas generadas? |
| Viernes | Feedback informal: "¿Cómo les fue?" |

### Semana 2: Autonomía Supervisada

| Día | Acción |
|-----|--------|
| Domingo | NO recordar (validar que lo hacen solos) |
| Lunes | Monitorear dashboard: ¿quién envió? |
| Miércoles | Si alguien no envió, preguntar por qué (¿UX? ¿olvidó?) |
| Viernes | Enviar formulario de retroalimentación |
| Sábado | Sesión grupal de cierre (30 min, presencial o virtual) |

### Canal de Soporte

- **WhatsApp:** Grupo "Piloto J-PDVE" — respuesta en < 30 min durante horario activo
- **Responsable:** [Tu nombre] como admin técnico
- **Escalación:** Si un bug bloquea el envío → hotfix en < 2 horas

---

## 8. Checklist Pre-Lanzamiento

### Infraestructura (ya listo)

- [x] Backend API funcional
- [x] Frontend desplegable (dev mode para piloto)
- [x] Base de datos con schema actualizado
- [x] Redis + Meilisearch configurados
- [x] Docker Compose local funcional

### Datos

- [ ] Crear campus con datos reales de la iglesia
- [ ] Crear redes ministeriales (al menos 2)
- [ ] Crear cuentas de usuarios piloto
- [ ] Crear equipos ministeriales con códigos
- [ ] Verificar que pipeline stages están cargados
- [ ] Asignar usuarios a equipos como LEADER

### UX

- [x] Sidebar con "Personas" visible
- [x] "Reportes" consistente en sidebar y bottom nav
- [x] Subtítulos diferenciadores (Acceso al Sistema vs Personas)
- [x] Report wizard con period locking
- [x] Branding J-PDVE completo
- [x] Bottom navigation mobile

### Comunicación

- [ ] Crear grupo WhatsApp piloto
- [ ] Enviar invitación con link + credenciales
- [ ] Preparar video tutorial (3 min)
- [ ] Preparar PDF guía rápida (1 página)
- [ ] Agendar sesión de capacitación (15 min)

### Monitoreo

- [ ] Verificar que alertas se generan correctamente
- [ ] Verificar que KPIs calculan con datos reales
- [ ] Tener acceso al audit log para troubleshooting
- [ ] Definir horario de soporte (ej: 8am-9pm)

---

## 9. Cronograma Propuesto

```
Semana 0 (Preparación):
├── Lun: Crear datos (campus, redes, equipos, usuarios)
├── Mar: Verificar que todo funciona (smoke test)
├── Mié: Preparar materiales (video, PDF)
├── Jue: Enviar invitaciones + credenciales
├── Vie: Sesión de capacitación (15 min)
└── Sáb: Confirmar que todos pueden hacer login

Semana 1 (Piloto Activo - Acompañamiento):
├── Dom: Primer reporte digital
├── Lun-Mié: Soporte activo, resolver dudas
├── Jue-Vie: Revisar métricas, feedback informal
└── Sáb: Checkpoint intermedio

Semana 2 (Piloto Activo - Autonomía):
├── Dom: Segundo reporte (sin recordatorio)
├── Lun-Mié: Monitoreo pasivo
├── Vie: Enviar encuesta de retroalimentación
└── Sáb: Sesión de cierre + resultados
```

---

## 10. Resultado Esperado

Al finalizar las 2 semanas tendremos:

1. **Datos reales** de uso del sistema (reportes, personas, tiempos)
2. **Feedback cualitativo** de líderes y coberturas
3. **Métricas** de adopción y satisfacción
4. **Lista de bugs/mejoras** priorizadas por impacto real
5. **Decisión informada** sobre: ¿expandir a toda la iglesia? ¿ajustar primero?

---

> **El piloto NO es para encontrar bugs. Es para validar que el producto resuelve el problema real de los líderes: reportar de forma simple, rápida y confiable desde el celular.**
