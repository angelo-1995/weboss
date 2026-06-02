# LAUNCH_PLAN.md — Plan de Lanzamiento J-PDVE Conexiones

> **Enfoque:** Validación → Adopción → Expansión
> **Primer target:** Red de Jóvenes
> **Filosofía:** Demostrar valor real antes de escalar

---

## Visión General de Fases

```
Fase 0 ──→ Fase 1 ──→ Fase 2 ──→ Fase 3 ──→ Fase 4 ──→ Fase 5 ──→ Fase 6
Datos       Smoke      Piloto     Red de      Todas      Iglesias    SaaS
Reales      Test       Oficial    Jóvenes     las Redes  Hijas
(1 día)     (3 días)   (2 sem)    (1 mes)     (2 meses)  (6 meses)  (Futuro)
```

---

## Fase 0: Preparación de Datos Reales

### Objetivo
Cargar datos reales de la Red de Jóvenes para que el sistema tenga contenido auténtico y no datos demo.

### Alcance
- Solo Red de Jóvenes (1 red)
- Pastor de Jóvenes + sus coberturas
- Equipos ministeriales con códigos reales
- Personas reales asignadas a equipos
- Pipeline stages configurados

### Participantes
| Rol | Persona | Responsabilidad |
|-----|---------|-----------------|
| Admin técnico | [Tú] | Cargar datos en el sistema |
| Pastor de Jóvenes | [Nombre] | Proveer lista de equipos, líderes, personas |
| Cobertura | [Nombre] | Validar que los datos sean correctos |

### Datos a Cargar

```
1. Campus: Actualizar "sede-central" con datos reales JPDVE
2. Red: Verificar que "Red de Jóvenes" (JOV) existe
3. Usuarios: Crear cuentas para pastor, coberturas, líderes
4. Equipos: Crear con código, día, hora, ubicación, asignar líderes
5. Personas: Registrar 5-10 por equipo con stage real
```

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Datos incompletos del liderazgo | Pedir lista Excel/WhatsApp con mínimo: nombre, código, líder |
| Códigos ministeriales incorrectos | Validar con pastor antes de cargar |
| Personas sin teléfono/email | Aceptar campos opcionales vacíos |

### Criterios de Éxito
- [ ] ≥ 3 equipos con datos reales cargados
- [ ] ≥ 15 personas reales registradas
- [ ] Jerarquía correcta verificada (pastor → cobertura → equipo)
- [ ] Pipeline stages visibles y correctos

### Criterios Go/No-Go → Fase 1
- **Go:** Datos cargados + login funcional para todos los participantes
- **No-Go:** No se pudieron obtener datos reales o hay errores de jerarquía

---

## Fase 1: Piloto 0 — Smoke Test

### Objetivo
Validar que el sistema funciona correctamente con datos reales en un entorno controlado antes de exponerlo a más usuarios.

### Alcance
- 5 participantes (1 pastor + 1 cobertura + 2 líderes + 1 admin)
- 2-3 días de prueba
- Flujos: reporte completo + dashboard + personas + alerta por no-reporte

### Participantes
| Rol | Persona | Test Principal |
|-----|---------|----------------|
| Pastor | [Nombre] | Dashboard + KPIs + organigrama |
| Cobertura | [Nombre] | Ver reportes de sus equipos + alertas |
| Líder 1 | [Nombre] | Enviar reporte + registrar persona |
| Líder 2 | [Nombre] | Enviar reporte + validar autosave |
| Admin | [Tú] | Monitorear + resolver issues + trigger alertas |

### Casos de Prueba

| # | Caso | Actor | Validación |
|---|------|-------|-----------|
| 1 | Login exitoso | Todos | Cada rol accede a su dashboard correcto |
| 2 | Crear reporte (período normal) | Líder 1 | Wizard → submit → aparece en dashboard |
| 3 | Crear reporte (período tardío) | Líder 2 | Banner amarillo "Envío Tardío" visible |
| 4 | Registrar persona visitante | Líder 2 | Persona aparece en /personas con stage |
| 5 | Ver jerarquía | Cobertura | Solo ve sus equipos, no los de otra cobertura |
| 6 | **Líder NO reporta** | — (inacción) | **Alerta generada → visible para cobertura y pastor** |
| 7 | Dashboard actualizado | Pastor | KPIs reflejan los reportes del día 2 |

### Caso 6 — Detalle: Validación de No-Reporte

**Precondición:** Líder 1 reporta. Líder 2 NO reporta.

**Pasos:**
1. Admin ejecuta detección de alertas: `POST /dashboard/alerts/detect`
2. Sistema detecta que equipo de Líder 2 no tiene reporte en 2+ semanas (o simular con datos)
3. Alerta tipo `MISSING_REPORT` se crea

**Validaciones:**
- [ ] Alerta aparece en dashboard del pastor
- [ ] Alerta aparece en dashboard de la cobertura
- [ ] Alerta muestra nombre del equipo + semanas sin reporte
- [ ] Botón "Atender" funciona (marca como acknowledged)
- [ ] KPI "Cumplimiento" refleja el equipo faltante (ej: 50% si 1 de 2 reportó)

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Alerta no se genera (requiere 2+ semanas de datos) | Admin puede crear alerta manual o ajustar threshold para test |
| Líder no entiende el wizard | Admin presente para guiar en tiempo real |
| Bug en period locking por timezone | Verificar timezone del campus = America/Panama |

### Criterios de Éxito
- [ ] 2 reportes enviados sin bugs bloqueantes
- [ ] KPIs actualizados con datos reales
- [ ] Alerta de no-reporte generada y visible
- [ ] Jerarquía funciona correctamente
- [ ] 0 bugs críticos
- [ ] Tiempo de reporte ≤ 5 minutos

### Criterios Go/No-Go → Fase 2
- **Go:** Todos los criterios de éxito cumplidos
- **No-Go:** Bug bloqueante en reporte o jerarquía incorrecta

---

## Fase 2: Piloto Oficial (2 Semanas)

### Objetivo
Validar adopción real con un grupo ampliado durante 2 ciclos de reporte dominical.

### Alcance
- 8-12 participantes (expandir desde Fase 1)
- Todos los equipos de la Red de Jóvenes bajo 1-2 coberturas
- Sin acompañamiento constante (autonomía supervisada en semana 2)

### Participantes
| Rol | Cantidad | Selección |
|-----|----------|-----------|
| Pastor de Jóvenes | 1 | El mismo de Fase 1 |
| Coberturas | 2-3 | Todas las de la Red de Jóvenes |
| Líderes | 5-8 | Todos los líderes activos de la red |
| Admin | 1 | Soporte técnico |

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Líder olvida reportar | Alertas automáticas + recordatorio WhatsApp semana 1 |
| Resistencia al cambio | Mostrar beneficio: "ves tu progreso en tiempo real" |
| Problema de conectividad | Autosave local + envío cuando haya señal |
| Fatiga post-novedad | Semana 2 sin presión, dejar que fluya |

### Criterios de Éxito
- [ ] ≥ 80% de reportes entregados digitalmente (vs papel)
- [ ] Tiempo promedio de reporte ≤ 3 minutos
- [ ] ≥ 70% satisfacción (encuesta)
- [ ] ≥ 60% prefiere app sobre papel (pregunta 16)
- [ ] 0 bugs críticos en las 2 semanas
- [ ] Pastor usa dashboard al menos 3 veces

### Criterios Go/No-Go → Fase 3
- **Go:** Métricas de éxito cumplidas + feedback mayoritariamente positivo
- **No-Go:** < 50% adopción o insatisfacción generalizada

---

## Fase 3: Despliegue Completo — Red de Jóvenes

### Objetivo
Migrar TODA la Red de Jóvenes a J-PDVE Conexiones. El papel deja de ser opción.

### Alcance
- Todos los equipos de la Red de Jóvenes (no solo piloto)
- Todas las personas registradas
- Dashboard como herramienta oficial del pastor de red
- Reportes digitales como único canal aceptado

### Participantes
- Pastor de Jóvenes (champion)
- Todas las coberturas de la red
- Todos los líderes y co-líderes
- Admin técnico (soporte reducido)

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Líderes que no participaron en piloto | Capacitación grupal (20 min) + video |
| Volumen de datos mayor | Verificar performance con 20+ equipos |
| Resistencia de líderes mayores | Asignar "buddy" joven que ayude |

### Criterios de Éxito
- [ ] 100% de equipos de la Red de Jóvenes reportando digitalmente
- [ ] 0 reportes en papel aceptados
- [ ] Pastor de red usa dashboard semanalmente
- [ ] ≥ 50 personas registradas con pipeline stage

### Criterios Go/No-Go → Fase 4
- **Go:** Red de Jóvenes operando establemente por 1 mes completo
- **No-Go:** Problemas persistentes de adopción o performance

---

## Fase 4: Expansión al Resto de Redes

### Objetivo
Replicar el éxito de la Red de Jóvenes a las demás redes del ministerio.

### Alcance
- Red de Caballeros
- Red de Damas
- Red de Jovencitas
- Red de Matrimonios
- Red de Niños

### Participantes
- Pastor General (champion organizacional)
- Pastores de cada red
- Todas las coberturas y líderes del ministerio

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Cada red tiene dinámicas diferentes | Capacitación por red, no masiva |
| Volumen 5x (100+ equipos) | Verificar performance, considerar deploy a producción |
| Necesidad de más roles/permisos | Evaluar MinistryPosition si necesario |

### Criterios de Éxito
- [ ] ≥ 80% adopción en todas las redes
- [ ] Dashboard unificado funcionando para Pastor General
- [ ] Alertas pastorales operativas para toda la iglesia
- [ ] Tiempo de reporte consistente ≤ 3 min

### Criterios Go/No-Go → Fase 5
- **Go:** Toda la iglesia madre operando digitalmente por 2+ meses
- **No-Go:** Alguna red con < 50% adopción

---

## Fase 5: Soporte para Iglesias Hijas

### Objetivo
Habilitar el modelo multi-church para iglesias hijas del Ministerio PDVE.

### Alcance
- Cada iglesia hija = un Campus con su propia configuración
- Pipeline stages independientes (si necesario)
- Redes y equipos propios
- Dashboard por iglesia + consolidado general

### Participantes
- Pastor General (visión global)
- Pastores de iglesias hijas
- Admin técnico (configuración)

### Riesgos
| Riesgo | Mitigación |
|--------|-----------|
| Aislamiento de datos insuficiente | campusId ya está en todas las entidades |
| Diferentes necesidades por iglesia | Pipeline stages configurables por campus |
| Soporte distribuido | Training de admins locales |

### Criterios de Éxito
- [ ] ≥ 2 iglesias hijas usando el sistema
- [ ] Datos correctamente aislados (cada iglesia ve solo lo suyo)
- [ ] Dashboard consolidado para Pastor General funcional

### Criterios Go/No-Go → Fase 6
- **Go:** Multi-church operando sin conflictos de datos
- **No-Go:** Problemas de aislamiento o performance

---

## Fase 6: Visión SaaS (Futuro)

### Objetivo
Transformar J-PDVE Conexiones en una plataforma SaaS para otras iglesias y ministerios.

### Alcance
- Onboarding self-service para nuevas iglesias
- Billing/subscriptions
- Customización de marca por tenant
- API pública
- App store / marketplace de módulos

### Participantes
- Equipo de producto
- Equipo de infraestructura
- Equipo comercial

### Prerequisitos
- [ ] Fase 5 estable por 6+ meses
- [ ] Infraestructura de producción (AWS ECS + RDS)
- [ ] Monitoring + observability completos
- [ ] Tests E2E automatizados
- [ ] Documentación de API (OpenAPI)
- [ ] GDPR/compliance para datos de terceros

### Nota
Esta fase NO tiene fecha. Solo se activa cuando las fases 0-5 demuestren que el producto resuelve un problema universal de gestión ministerial.

---

## Resumen de Timeline Estimado

| Fase | Duración | Prerequisito |
|------|----------|-------------|
| Fase 0 | 1 día | Datos del pastor de jóvenes |
| Fase 1 | 3 días | Fase 0 completa |
| Fase 2 | 2 semanas | Fase 1 "Go" |
| Fase 3 | 1 mes | Fase 2 "Go" |
| Fase 4 | 2-3 meses | Fase 3 estable |
| Fase 5 | 6+ meses | Fase 4 estable + infra producción |
| Fase 6 | TBD | Fase 5 + validación de mercado |

**Total para validar con Red de Jóvenes (Fases 0-2): ~3 semanas**
**Total para toda la iglesia (Fases 0-4): ~4-5 meses**
