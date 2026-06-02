# Bugfix Requirements Document

## Introduction

El sistema J-PDVE Conexiones no implementa filtrado jerárquico ni RBAC ministerial en sus endpoints. El servicio `HierarchyVisibilityService` existe con la lógica correcta (`getVisibleGroupIds`, `getVisibleUserIds`) pero **ningún endpoint lo invoca**. El resultado: todos los usuarios (35 activos) ven TODOS los datos de la organización (19 equipos, 97 personas, 702 reportes) sin importar su rol o posición jerárquica. Esto viola el modelo ministerial de la iglesia y la confidencialidad pastoral.

Adicionalmente, existen dos errores funcionales bloqueantes: el endpoint de detalle de usuario falla, y el envío de invitaciones no funciona por configuración SMTP incorrecta.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN un usuario con rol LEADER consulta GET /api/v1/groups THEN el sistema retorna TODOS los equipos de la organización (19 equipos) sin filtrar por jerarquía

1.2 WHEN un usuario con rol LEADER consulta GET /api/v1/persons THEN el sistema retorna TODAS las personas (97) sin filtrar por alcance ministerial

1.3 WHEN un usuario con rol LEADER consulta GET /api/v1/users THEN el sistema retorna TODOS los usuarios (35) sin filtrar por jerarquía

1.4 WHEN un usuario con rol LEADER consulta GET /api/v1/analytics/kpis THEN el sistema retorna métricas globales de toda la organización (asistencia total, visitantes totales, ofrenda total)

1.5 WHEN un usuario con rol LEADER consulta el Pipeline THEN el sistema muestra personas de TODA la organización, no solo las de sus grupos visibles

1.6 WHEN un usuario con rol LEADER o COBERTURA accede al frontend THEN el menú muestra "Acceso al Sistema" y "Gestión de Predicaciones (admin)" que corresponden solo a ADMIN y SUPER_ADMIN

1.7 WHEN un usuario con rol ADMIN o SUPER_ADMIN consulta GET /api/v1/users/:id THEN el sistema retorna "Error al cargar el usuario" en lugar de los datos del usuario

1.8 WHEN un usuario intenta enviar una invitación vía POST /api/v1/invitations THEN el sistema retorna "Error al enviar la invitación" por configuración SMTP incorrecta

### Expected Behavior (Correct)

2.1 WHEN un usuario con rol LEADER consulta GET /api/v1/groups THEN el sistema SHALL retornar únicamente su célula y las células donde es LEADER o CO_LEADER, filtrado mediante `HierarchyVisibilityService.getVisibleGroupIds(userId, roles)`

2.2 WHEN un usuario con rol LEADER consulta GET /api/v1/persons THEN el sistema SHALL retornar únicamente las personas cuyo `currentGroupId` esté en los grupos visibles del usuario

2.3 WHEN un usuario con rol LEADER consulta GET /api/v1/users THEN el sistema SHALL retornar únicamente los usuarios que pertenecen a sus grupos visibles según `HierarchyVisibilityService.getVisibleUserIds(userId, roles)`

2.4 WHEN un usuario con rol LEADER consulta GET /api/v1/analytics/kpis THEN el sistema SHALL retornar métricas calculadas SOLO para los grupos visibles del usuario (su célula), no datos globales

2.5 WHEN un usuario con rol LEADER consulta el Pipeline THEN el sistema SHALL mostrar únicamente personas cuyos grupos están en el alcance jerárquico del usuario

2.6 WHEN un usuario con rol LEADER o COBERTURA accede al frontend THEN el sistema SHALL ocultar los ítems de menú "Acceso al Sistema" y "Gestión de Predicaciones (admin)", mostrando solo los menús autorizados para su rol

2.7 WHEN cualquier usuario autenticado consulta GET /api/v1/users/:id THEN el sistema SHALL retornar los datos del usuario correctamente, manejando la relación User↔Person nullable sin error

2.8 WHEN un usuario envía una invitación vía POST /api/v1/invitations THEN el sistema SHALL enviar el email correctamente usando la configuración SMTP con App Password de Gmail

### Unchanged Behavior (Regression Prevention)

3.1 WHEN un usuario con rol SUPER_ADMIN consulta cualquier endpoint de datos THEN el sistema SHALL CONTINUE TO retornar TODOS los datos de la organización sin filtrado

3.2 WHEN un usuario con rol ADMIN (Pastor de Red) consulta endpoints de datos THEN el sistema SHALL CONTINUE TO retornar todos los datos de su red (según su leaderCode prefix)

3.3 WHEN un usuario con rol LEADER realiza operaciones de escritura (crear reporte, actualizar grupo propio) THEN el sistema SHALL CONTINUE TO permitir estas operaciones sin cambios

3.4 WHEN el sistema autentica usuarios via JWT THEN el sistema SHALL CONTINUE TO validar tokens y roles correctamente sin cambios en el flujo de autenticación

3.5 WHEN un usuario con rol SUPER_ADMIN accede al frontend THEN el sistema SHALL CONTINUE TO mostrar TODOS los ítems de menú incluyendo "Acceso al Sistema" y "Gestión de Predicaciones (admin)"

3.6 WHEN un usuario consulta GET /api/v1/groups/:id para un grupo dentro de su alcance visible THEN el sistema SHALL CONTINUE TO retornar el detalle del grupo correctamente

3.7 WHEN el `HierarchyVisibilityService` retorna `null` para usuarios con full access THEN el sistema SHALL CONTINUE TO interpretar `null` como "sin filtro" (ver todo)
