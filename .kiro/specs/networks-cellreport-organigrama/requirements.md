# Requirements Document

## Introduction

Este feature reemplaza el modelo WeeklyReport existente con un nuevo modelo CellReport que captura todos los campos del formulario físico de reporte de célula. Además, introduce un modelo de redes jerárquicas (Network), campos organizacionales en el usuario (cónyuge, líder de cobertura, red), extiende el enum RelationshipType con COVERAGE, y provee una visualización de organigrama interactivo con React Flow.

## Glossary

- **CellReport**: Modelo de datos que registra el informe semanal de una célula, incluyendo asistencia desglosada, métricas de crecimiento, datos de reunión y ubicación.
- **Network**: Modelo jerárquico que representa la estructura de redes de la iglesia (red de caballeros, damas, jóvenes, etc.). Administrado por seed, sin CRUD de usuario.
- **Organigrama**: Visualización interactiva tipo árbol/grafo que muestra la estructura de liderazgo y cobertura de la iglesia.
- **Coverage**: Tipo de relación de cobertura pastoral entre un líder superior y un líder subordinado, representada en DiscipleshipRelationship.
- **Sistema_CellReport**: Módulo backend (API + base de datos) responsable de la gestión de reportes de célula.
- **Sistema_Network**: Módulo backend responsable de la gestión del modelo de redes jerárquicas.
- **Sistema_User**: Módulo backend responsable de la gestión de usuarios y sus campos organizacionales.
- **Sistema_Organigrama**: Módulo frontend responsable de la visualización del organigrama interactivo.
- **Líder**: Usuario con rol LEADER en un grupo de tipo CELL.
- **Co-líder**: Usuario con rol CO_LEADER en un grupo de tipo CELL.
- **Semana_Calendario**: Período de lunes 00:00:00 a domingo 23:59:59 de una semana dada.

## Requirements

### Requirement 1: Modelo CellReport

**User Story:** Como líder de célula, quiero registrar un informe completo de mi reunión semanal con todos los campos del formulario físico, para que la iglesia tenga datos precisos de asistencia, crecimiento y logística.

#### Acceptance Criteria

1.1 THE Sistema_CellReport SHALL almacenar los siguientes campos para cada reporte: código de célula, fecha de reunión, cobertura (nombre del líder de cobertura), líder, co-líder, teléfono de contacto, asistencia de caballeros, asistencia de damas, asistencia de jóvenes, asistencia de jovencitas, asistencia de niños, cantidad de visitas, cantidad de convertidos, cantidad de reconciliados, tema del mensaje, hora de inicio, hora de finalización, monto de ofrenda, corregimiento, barriada, sector, calle, casa, indicador de supervisión (booleano), y observaciones.

1.2 THE Sistema_CellReport SHALL asociar cada CellReport con un grupo existente mediante una clave foránea al modelo Group.

1.3 THE Sistema_CellReport SHALL asociar cada CellReport con el usuario que lo envía mediante una clave foránea al modelo User.

1.4 WHEN se crea un CellReport, THE Sistema_CellReport SHALL calcular la asistencia total como la suma de caballeros, damas, jóvenes, jovencitas y niños.

1.5 THE Sistema_CellReport SHALL reemplazar el modelo WeeklyReport existente, migrando la tabla y eliminando el modelo anterior del esquema.

### Requirement 2: Validación de Envío de CellReport

**User Story:** Como administrador, quiero que solo el líder o co-líder de una célula pueda enviar el reporte, y que no se permitan duplicados semanales, para garantizar la integridad de los datos.

#### Acceptance Criteria

2.1 WHEN un usuario intenta crear un CellReport, THE Sistema_CellReport SHALL verificar que el usuario tiene rol LEADER o CO_LEADER en el grupo asociado al reporte.

2.2 IF un usuario sin rol LEADER o CO_LEADER en el grupo intenta crear un CellReport, THEN THE Sistema_CellReport SHALL rechazar la solicitud con un código de error 403 y el mensaje "Solo el líder o co-líder de la célula puede enviar el reporte".

2.3 WHEN un usuario intenta crear un CellReport para un grupo en una Semana_Calendario específica, THE Sistema_CellReport SHALL verificar que no exista otro CellReport para el mismo grupo en la misma Semana_Calendario.

2.4 IF ya existe un CellReport para el mismo grupo en la misma Semana_Calendario, THEN THE Sistema_CellReport SHALL rechazar la solicitud con un código de error 409 y el mensaje "Ya existe un reporte para esta célula en la semana indicada".

2.5 WHEN se recibe una fecha de reunión, THE Sistema_CellReport SHALL validar que la fecha no sea futura respecto a la fecha y hora actual del servidor.

### Requirement 3: API de CellReport

**User Story:** Como desarrollador frontend, quiero endpoints REST para crear, listar y consultar reportes de célula, para construir la interfaz de usuario.

#### Acceptance Criteria

3.1 THE Sistema_CellReport SHALL exponer un endpoint POST /reports/cell que acepte el payload completo del CellReport y retorne el reporte creado con sus relaciones.

3.2 THE Sistema_CellReport SHALL exponer un endpoint GET /reports/cell que retorne una lista paginada de reportes con filtros por grupo, rango de fechas y red.

3.3 WHILE el usuario autenticado tiene rol ADMIN o SUPER_ADMIN, THE Sistema_CellReport SHALL retornar reportes de todos los grupos en el endpoint GET /reports/cell.

3.4 WHILE el usuario autenticado tiene rol LEADER, THE Sistema_CellReport SHALL retornar únicamente reportes de los grupos donde el usuario es LEADER o CO_LEADER en el endpoint GET /reports/cell.

3.5 THE Sistema_CellReport SHALL exponer un endpoint GET /reports/cell/pending que retorne los grupos que no han enviado reporte en la Semana_Calendario actual.

### Requirement 4: Modelo Network (Redes Jerárquicas)

**User Story:** Como administrador de la iglesia, quiero que exista una estructura jerárquica de redes predefinida en el sistema, para clasificar usuarios y grupos por red.

#### Acceptance Criteria

4.1 THE Sistema_Network SHALL almacenar cada red con los campos: id (UUID), código (string único), nombre, y referencia al padre (parent_network_id, nullable para redes raíz).

4.2 THE Sistema_Network SHALL soportar una jerarquía de profundidad arbitraria mediante la relación recursiva parent_network_id.

4.3 THE Sistema_Network SHALL exponer un endpoint GET /networks que retorne el árbol completo de redes en formato jerárquico.

4.4 THE Sistema_Network SHALL poblar la jerarquía de redes mediante un script de seed ejecutable con el comando de migración de base de datos.

### Requirement 5: Campos Organizacionales del Usuario

**User Story:** Como administrador, quiero registrar el cónyuge, líder de cobertura y red de cada usuario, para reflejar la estructura organizacional real de la iglesia.

#### Acceptance Criteria

5.1 THE Sistema_User SHALL almacenar en cada usuario una referencia opcional al cónyuge (spouse_id como FK a User).

5.2 THE Sistema_User SHALL almacenar en cada usuario una referencia opcional al líder de cobertura (leader_id como FK a User).

5.3 THE Sistema_User SHALL almacenar en cada usuario una referencia opcional a la red (network_id como FK a Network).

5.4 WHEN se actualiza el perfil de un usuario, THE Sistema_User SHALL permitir asignar o modificar los campos spouse_id, leader_id y network_id.

5.5 IF el spouse_id referencia un usuario inexistente, THEN THE Sistema_User SHALL rechazar la actualización con un código de error 400 y el mensaje "El usuario cónyuge especificado no existe".

5.6 IF el leader_id referencia un usuario inexistente, THEN THE Sistema_User SHALL rechazar la actualización con un código de error 400 y el mensaje "El usuario líder de cobertura especificado no existe".

### Requirement 6: Relación de Cobertura (Coverage)

**User Story:** Como administrador, quiero registrar relaciones de cobertura pastoral entre líderes, para representar la cadena de supervisión en el organigrama.

#### Acceptance Criteria

6.1 THE Sistema_User SHALL incluir el valor COVERAGE en el enum RelationshipType existente.

6.2 WHEN se crea una relación de tipo COVERAGE en DiscipleshipRelationship, THE Sistema_User SHALL interpretar el campo mentorId como el líder de cobertura y discipleId como el líder cubierto.

6.3 THE Sistema_User SHALL permitir crear relaciones COVERAGE mediante el endpoint existente de DiscipleshipRelationship.

### Requirement 7: Asignación de Red a Grupos

**User Story:** Como administrador, quiero asignar una red a cada grupo, para poder filtrar reportes y visualizar el organigrama por red.

#### Acceptance Criteria

7.1 THE Sistema_Network SHALL almacenar en cada grupo una referencia opcional a la red (network_id como FK a Network).

7.2 WHEN se crea o actualiza un grupo, THE Sistema_Network SHALL permitir asignar el campo network_id.

7.3 IF el network_id referencia una red inexistente, THEN THE Sistema_Network SHALL rechazar la operación con un código de error 400 y el mensaje "La red especificada no existe".

### Requirement 8: Visualización del Organigrama

**User Story:** Como pastor o administrador, quiero ver un organigrama interactivo que muestre toda la estructura de liderazgo y cobertura de la iglesia, para entender las relaciones jerárquicas de un vistazo.

#### Acceptance Criteria

8.1 THE Sistema_Organigrama SHALL renderizar una visualización de grafo interactivo en la ruta /organigrama utilizando React Flow.

8.2 THE Sistema_Organigrama SHALL representar cada usuario con relaciones de cobertura como un nodo del grafo, mostrando nombre y rol.

8.3 THE Sistema_Organigrama SHALL representar cada relación de tipo COVERAGE como una arista dirigida del líder de cobertura al líder cubierto.

8.4 THE Sistema_Organigrama SHALL aplicar un código de color diferente a cada nodo según la red (network_id) del usuario.

8.5 THE Sistema_Organigrama SHALL permitir expandir y colapsar subárboles del organigrama mediante interacción del usuario (clic en nodo).

8.6 THE Sistema_Organigrama SHALL aplicar un layout jerárquico automático (de arriba hacia abajo) para organizar los nodos.

8.7 THE Sistema_Organigrama SHALL mostrar una leyenda con los colores correspondientes a cada red.

8.8 WHEN el usuario pasa el cursor sobre un nodo, THE Sistema_Organigrama SHALL mostrar un tooltip con información adicional del usuario: teléfono, red, y cantidad de personas bajo su cobertura.

### Requirement 9: API del Organigrama

**User Story:** Como desarrollador frontend, quiero un endpoint que retorne los datos del organigrama en formato de nodos y aristas, para alimentar la visualización React Flow.

#### Acceptance Criteria

9.1 THE Sistema_User SHALL exponer un endpoint GET /organigrama que retorne la estructura completa de nodos (usuarios) y aristas (relaciones COVERAGE).

9.2 THE Sistema_User SHALL incluir en cada nodo del response: id, nombre completo, rol, network_id, nombre de red, y teléfono.

9.3 THE Sistema_User SHALL incluir en cada arista del response: id de la relación, source (mentor_id), y target (disciple_id).

9.4 WHILE el usuario autenticado tiene rol ADMIN, SUPER_ADMIN o LEADER, THE Sistema_User SHALL permitir acceso al endpoint GET /organigrama.

### Requirement 10: Interfaz de Formulario CellReport

**User Story:** Como líder de célula, quiero un formulario en español que refleje exactamente el formulario físico de reporte, para registrar la información de mi reunión de forma digital.

#### Acceptance Criteria

10.1 THE Sistema_Organigrama SHALL presentar un formulario en la ruta /reports con todos los campos del CellReport organizados en secciones: Información General, Asistencia, Métricas de Crecimiento, Reunión, Ubicación y Observaciones.

10.2 THE Sistema_Organigrama SHALL mostrar todos los labels, placeholders y mensajes de validación en idioma español.

10.3 WHEN el formulario se envía exitosamente, THE Sistema_Organigrama SHALL mostrar una notificación de éxito con el mensaje "Reporte de célula enviado correctamente".

10.4 IF el servidor retorna un error de duplicado (409), THEN THE Sistema_Organigrama SHALL mostrar un mensaje de error "Ya existe un reporte para esta célula en la semana indicada".

10.5 IF el servidor retorna un error de permisos (403), THEN THE Sistema_Organigrama SHALL mostrar un mensaje de error "Solo el líder o co-líder de la célula puede enviar el reporte".

### Requirement 11: Navegación

**User Story:** Como usuario del sistema, quiero acceder al organigrama y a los reportes de célula desde el menú de navegación lateral, para encontrar estas funcionalidades fácilmente.

#### Acceptance Criteria

11.1 THE Sistema_Organigrama SHALL agregar un enlace "Organigrama" en el menú de navegación lateral, visible para usuarios con rol ADMIN, SUPER_ADMIN o LEADER.

11.2 THE Sistema_Organigrama SHALL mantener el enlace existente "Informes" en el menú de navegación lateral, apuntando a la ruta /reports con el formulario de CellReport actualizado.
