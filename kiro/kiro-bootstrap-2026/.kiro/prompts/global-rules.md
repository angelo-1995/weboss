# GLOBAL RULES — Reglas de Desarrollo

## Regla #1 — NO regenerar archivos completos

Antes de modificar cualquier archivo:
1. Analizar el impacto del cambio
2. Reutilizar código existente
3. Validar dependencias afectadas
4. Minimizar consumo de tokens

Solo generar el **diff mínimo necesario**.

## Regla #2 — Trabajo incremental

- Cambios pequeños y precisos
- Un módulo a la vez
- Validar antes de continuar al siguiente

## Regla #3 — No duplicación

- Antes de crear un componente/función, buscar si ya existe
- Extraer lógica común a `packages/shared`
- Componentes UI en `packages/ui`

## Regla #4 — No arquitectura monolítica

- Cada dominio es independiente
- Comunicación entre dominios via eventos o interfaces públicas
- No importar internals de otro dominio directamente

## Regla #5 — Validaciones antes de cada cambio

Checklist obligatorio:
- [ ] Seguridad: ¿el cambio expone datos sensibles?
- [ ] Performance: ¿el cambio introduce queries lentas o renders innecesarios?
- [ ] Escalabilidad: ¿funciona con 10x los datos actuales?
- [ ] Desacoplamiento: ¿el cambio crea dependencias innecesarias?
- [ ] Mantenibilidad: ¿el código es legible y documentado?
- [ ] Reutilización: ¿se puede extraer para uso futuro?

## Formato de Respuesta Obligatorio

Cuando se solicite una funcionalidad, responder con:

1. **Análisis técnico** — qué implica el cambio
2. **Impacto arquitectónico** — qué módulos/archivos se ven afectados
3. **Archivos afectados** — lista específica
4. **Estrategia mínima** — el cambio más pequeño posible
5. **Implementación incremental** — pasos ordenados
6. **Riesgos técnicos** — qué puede salir mal
7. **Validaciones necesarias** — qué testear

## Lo que NO se genera

- Archivos completos si solo se necesita un cambio puntual
- Código redundante o boilerplate excesivo
- Sistemas completos en una sola respuesta
- Landing pages, marketing, multimedia (no es prioridad)

## Lo que SÍ se genera

- Cambios incrementales con contexto claro
- Diffs específicos y aplicables
- Componentes reutilizables bien tipados
- Documentación inline relevante
