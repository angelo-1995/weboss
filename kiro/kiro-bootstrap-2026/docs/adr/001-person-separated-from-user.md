# ADR-001: Person Separado de User

**Estado:** Aprobado
**Fecha:** 2026-06-01
**Contexto:** Evolución Community OS → J-PDVE Conexiones

---

## Contexto

El sistema actual modela a todas las personas como `User` (entidad con credenciales de acceso). Sin embargo, el dominio ministerial requiere registrar personas que NO tienen acceso al sistema (visitantes, consolidados, personas en seguimiento).

El PRD establece como regla no negociable: "Persons and Users are separate entities. A person may exist without having system access."

## Decisión

Crear una entidad `Person` independiente de `User`.

- `Person` = individuo del ministerio (datos personales, pipeline stage, equipo asignado)
- `User` = cuenta de acceso al sistema (email, password, rol técnico, sesiones)
- Un `User` PUEDE referenciar a un `Person` (FK nullable: `user.person_id`)
- Un `Person` PUEDE existir sin `User` asociado

## Consecuencias

### Positivas
- Personas sin acceso al sistema (visitantes, nuevos) se registran formalmente
- El pipeline pastoral aplica a Person, no a User
- La asignación a equipos es de Person, no de User
- Separación limpia: identidad digital ≠ identidad ministerial
- Permite analytics de personas que nunca han tenido login

### Negativas
- Requiere migration de datos existentes (crear Person por cada User)
- JOIN adicional en queries que necesitan datos de persona + acceso
- Frontend debe manejar ambos modelos

## Estrategia de Migración

1. Crear tabla `persons` con campos: firstName, lastName, phone, email, gender, birthDate, avatarUrl, currentTeamId, pipelineStageId, notes
2. Agregar columna `person_id` (UUID, nullable, UNIQUE) en `users`
3. Migration script: por cada User existente, crear un Person con los datos copiados y asignar el FK
4. **NO eliminar** firstName/lastName/phone de `users` — mantener como cache/compatibilidad
5. Nuevas features usan Person. Features existentes siguen funcionando con User.

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|------------|-------------------|
| Mantener todo en User con flag `hasAccess` | No modela correctamente que una persona puede existir SIN cuenta. Rompe Single Responsibility. |
| Herencia (Person extends User) | Prisma no soporta herencia de tabla. Agrega complejidad innecesaria. |
| Crear Person solo para quienes no tienen User | Inconsistente: algunos datos en User, otros en Person. Queries complicadas. |

## Referencias
- PRD: "Persons and Users are separate entities"
- RISK_REGISTER.md: Riesgos 1.1-1.5
