# Requirements Document

## Introduction

Aplicación móvil Android MVP de la Biblia Reina Valera 1960 construida con Flutter. La app ofrece lectura offline completa, navegación por libros/capítulos/versículos, búsqueda local ultra rápida, favoritos, notas por versículo, versículo del día, temas oscuro/claro, y compartir versículos como imagen elegante. Diseño premium moderno inspirado en Spotify, Kindle, Notion y YouVersion. Arquitectura Clean Architecture con estructura feature-based, usando Riverpod, Hive, GoRouter, Material 3, freezed y json_serializable. El proyecto se ubica en `c:\Users\perez\webb_PDVE\PROYECTOArceus`.

## Glossary

- **App**: La aplicación móvil Android de la Biblia Reina Valera 1960 construida con Flutter
- **Bible_Database**: Base de datos local Hive que contiene el texto completo de la Biblia RVR1960 (66 libros, 1189 capítulos, 31102 versículos)
- **Book**: Uno de los 66 libros de la Biblia RVR1960, con nombre, abreviatura, testamento (AT/NT) y número de capítulos
- **Chapter**: División de un libro bíblico que contiene un conjunto ordenado de versículos
- **Verse**: Unidad mínima de texto bíblico, identificada por libro, capítulo y número de versículo
- **Home_Screen**: Pantalla principal que muestra versículo del día, continuar lectura y accesos rápidos
- **Bible_Reader**: Pantalla de lectura que muestra los versículos de un capítulo con scroll fluido
- **Search_Engine**: Motor de búsqueda local que indexa el texto bíblico para consultas instantáneas
- **Favorites_Store**: Almacén persistente local (Hive) de versículos marcados como favoritos
- **Notes_Store**: Almacén persistente local (Hive) de notas asociadas a versículos específicos
- **Theme_Manager**: Servicio que gestiona el tema visual (oscuro/claro) y preferencias tipográficas
- **Share_Generator**: Servicio que genera imágenes elegantes de versículos para compartir en redes sociales
- **Navigation_System**: Sistema de navegación basado en GoRouter con bottom navigation bar
- **Settings_Screen**: Pantalla de configuración para tema, tamaño de fuente y tipo de letra
- **Reading_Position**: Registro persistente de la última posición de lectura del usuario (libro, capítulo, versículo)
- **Daily_Verse**: Versículo seleccionado automáticamente cada día para mostrar en Home

## Requirements

### Requirement 1: Almacenamiento Offline de la Biblia Completa

**User Story:** Como usuario, quiero tener la Biblia Reina Valera 1960 completa disponible offline, para poder leer sin conexión a internet.

#### Acceptance Criteria

1. THE Bible_Database SHALL contener los 66 libros completos de la Biblia Reina Valera 1960 con sus 1189 capítulos y 31102 versículos
2. THE Bible_Database SHALL almacenar para cada versículo: identificador de libro, número de capítulo, número de versículo y texto completo, donde ningún campo puede ser nulo o vacío
3. THE Bible_Database SHALL almacenar para cada libro: nombre completo, abreviatura, testamento (Antiguo/Nuevo) y cantidad de capítulos
4. THE App SHALL permitir la navegación de libros, capítulos y versículos, y la lectura del texto bíblico sin conexión a internet después de la primera instalación
5. WHEN la App se inicia por primera vez, THE Bible_Database SHALL pre-cargar todos los datos bíblicos desde un asset local en menos de 5 segundos en un dispositivo con al menos 2 GB de RAM
6. IF la carga inicial de datos es interrumpida o falla, THEN THE App SHALL reintentar la carga completa desde el asset local en el siguiente inicio de la aplicación sin pérdida de datos previamente cargados
7. WHEN la carga inicial finaliza, THE Bible_Database SHALL contener exactamente 31102 versículos sin registros duplicados (combinación única de libro, capítulo y número de versículo)

### Requirement 2: Navegación por Libros, Capítulos y Versículos

**User Story:** Como usuario, quiero navegar fácilmente entre libros, capítulos y versículos, para encontrar rápidamente el pasaje que busco.

#### Acceptance Criteria

1. THE Bible_Reader SHALL presentar una lista de los 66 libros organizados por testamento (Antiguo y Nuevo Testamento)
2. WHEN el usuario selecciona un libro, THE Bible_Reader SHALL mostrar la lista de capítulos disponibles para ese libro
3. WHEN el usuario selecciona un capítulo, THE Bible_Reader SHALL mostrar todos los versículos del capítulo con scroll vertical a un mínimo de 60 fotogramas por segundo sin saltos visibles de contenido
4. WHILE el usuario lee un capítulo, THE Bible_Reader SHALL permitir navegar al capítulo anterior y siguiente mediante gestos de swipe o botones, deshabilitando la acción "anterior" en el primer capítulo del primer libro y la acción "siguiente" en el último capítulo del último libro
5. THE Navigation_System SHALL permitir cambio de libro y capítulo desde la pantalla de lectura en un máximo de 2 toques sin regresar a la lista principal
6. THE Bible_Reader SHALL renderizar la lista de versículos de un capítulo en menos de 100 milisegundos
7. IF la carga de versículos de un capítulo falla, THEN THE Bible_Reader SHALL mostrar un mensaje de error indicando la falla y ofrecer una opción de reintentar sin perder la selección actual de libro y capítulo

### Requirement 3: Pantalla Home con Versículo del Día

**User Story:** Como usuario, quiero ver un versículo inspirador al abrir la app y acceder rápidamente a mi lectura, para tener una experiencia motivadora.

#### Acceptance Criteria

1. THE Home_Screen SHALL mostrar un Daily_Verse diferente cada día calendario, incluyendo el texto del versículo (máximo 300 caracteres), la referencia bíblica (libro, capítulo y versículo) y el nombre de la traducción utilizada
2. IF el usuario no tiene Reading_Position guardada (primer uso o historial vacío), THEN THE Home_Screen SHALL ocultar la sección "Continuar Lectura" y mostrar únicamente el Daily_Verse y los accesos rápidos
3. IF el usuario tiene al menos una Reading_Position guardada, THEN THE Home_Screen SHALL mostrar la Reading_Position más reciente indicando libro, capítulo, y versículo donde se detuvo, con un botón "Continuar Lectura"
4. THE Home_Screen SHALL proporcionar accesos rápidos a las secciones principales: Biblia, Búsqueda, Favoritos y Notas
5. WHEN el usuario toca el Daily_Verse, THE App SHALL navegar al capítulo completo que contiene el versículo en el Bible_Reader, con scroll automático hasta el versículo del día
6. WHEN el usuario toca "Continuar Lectura", THE App SHALL navegar directamente a la Reading_Position guardada en el Bible_Reader
7. THE Daily_Verse SHALL seleccionarse de forma determinista basada en la fecha actual (mismo versículo para el mismo día para todos los usuarios) a partir de un pool mínimo de 365 versículos sin repetición dentro del mismo año calendario
8. THE Home_Screen SHALL completar su renderizado inicial (Daily_Verse y accesos rápidos visibles) en un máximo de 2 segundos desde que el usuario abre la app

### Requirement 4: Búsqueda Local Ultra Rápida

**User Story:** Como usuario, quiero buscar palabras o frases en toda la Biblia de forma instantánea, para encontrar versículos relevantes rápidamente.

#### Acceptance Criteria

1. WHEN el usuario ingresa un término de búsqueda de 3 o más caracteres y han transcurrido 300 milisegundos desde la última pulsación de tecla (debounce), THE Search_Engine SHALL mostrar resultados en menos de 300 milisegundos medidos desde el momento en que se dispara la búsqueda
2. THE Search_Engine SHALL buscar coincidencias en el texto completo de los 31102 versículos y mostrar un máximo de 100 resultados ordenados por relevancia
3. WHEN el Search_Engine muestra resultados de búsqueda, THE Search_Engine SHALL resaltar los términos coincidentes dentro del texto de cada resultado usando un color de fondo diferenciado del texto circundante
4. WHEN el Search_Engine muestra resultados de búsqueda, THE Search_Engine SHALL mostrar cada resultado con la referencia completa en formato "Libro Capítulo:Versículo" y un fragmento de texto de entre 40 y 120 caracteres que contenga el término encontrado
5. WHEN el usuario selecciona un resultado de búsqueda, THE App SHALL navegar al versículo correspondiente dentro del Bible_Reader mostrando al menos 2 versículos antes y 2 versículos después como contexto
6. THE Search_Engine SHALL soportar búsqueda sin distinción de mayúsculas/minúsculas y sin sensibilidad a acentos
7. IF el término de búsqueda no produce resultados, THEN THE Search_Engine SHALL mostrar un mensaje indicando que no se encontraron coincidencias y mantener visible el campo de búsqueda con el término ingresado
8. IF el término de búsqueda tiene menos de 3 caracteres, THEN THE Search_Engine SHALL no ejecutar la búsqueda y no mostrar resultados

### Requirement 5: Gestión de Favoritos

**User Story:** Como usuario, quiero marcar versículos como favoritos y acceder a ellos fácilmente, para guardar los pasajes más significativos.

#### Acceptance Criteria

1. WHEN el usuario marca un versículo como favorito, THE Favorites_Store SHALL persistir la referencia del versículo (libro, capítulo y número de versículo) con timestamp de creación en almacenamiento local y THE App SHALL mostrar una confirmación visual transitoria durante un máximo de 3 segundos
2. WHEN el usuario desmarca un versículo de favoritos, THE Favorites_Store SHALL eliminar la referencia del almacenamiento local y THE App SHALL actualizar el indicador visual del versículo en un máximo de 500 milisegundos
3. WHEN el usuario accede a la sección de favoritos, THE Favorites_Store SHALL mostrar la lista de versículos favoritos ordenados por fecha de adición (más recientes primero), mostrando por cada entrada el texto de referencia (libro, capítulo:versículo) y la fecha de adición, con un máximo de 20 elementos por carga y paginación para acceder al resto
4. WHEN el usuario selecciona un favorito de la lista, THE App SHALL navegar al capítulo correspondiente dentro del Bible_Reader y desplazar la vista hasta el versículo seleccionado, resaltándolo visualmente con un indicador distinguible del texto circundante
5. THE Favorites_Store SHALL preservar todos los favoritos entre sesiones de la aplicación sin pérdida de datos
6. WHILE el usuario visualiza un versículo en el Bible_Reader, THE App SHALL mostrar un icono de favorito adyacente al versículo que refleje su estado actual (marcado o no marcado) y que sea accionable para alternar dicho estado
7. IF la operación de escritura en almacenamiento local falla al marcar o desmarcar un favorito, THEN THE App SHALL mostrar un mensaje de error indicando que la acción no pudo completarse y SHALL mantener el estado previo del favorito sin modificaciones

### Requirement 6: Notas por Versículo

**User Story:** Como usuario, quiero crear notas personales asociadas a versículos específicos, para registrar mis reflexiones y estudios.

#### Acceptance Criteria

1. WHEN el usuario crea una nota para un versículo con texto de entre 1 y 5000 caracteres, THE Notes_Store SHALL persistir el texto de la nota asociado a la referencia del versículo con timestamp de creación y última modificación
2. WHEN el usuario edita una nota existente, THE Notes_Store SHALL actualizar el texto y el timestamp de última modificación preservando el timestamp de creación original
3. WHEN el usuario elimina una nota, THE Notes_Store SHALL remover la nota del almacenamiento local y confirmar la eliminación exitosa al usuario
4. WHEN el usuario navega a la lista de notas, THE Notes_Store SHALL mostrar la lista de todas las notas ordenadas por fecha de última modificación descendente, incluyendo la referencia del versículo asociado y los primeros 100 caracteres del contenido como preview
5. WHILE el usuario visualiza un versículo en el Bible_Reader, THE App SHALL mostrar un ícono indicador junto al versículo si este tiene una nota asociada
6. THE Notes_Store SHALL preservar todas las notas entre sesiones de la aplicación, recuperando el mismo contenido y metadatos tras cerrar y reabrir la app
7. WHEN el usuario selecciona una nota de la lista, THE App SHALL navegar al versículo asociado en el Bible_Reader mostrando el capítulo completo con el versículo resaltado y visible en pantalla
8. IF el usuario intenta guardar una nota con texto vacío o compuesto solo por espacios en blanco, THEN THE Notes_Store SHALL rechazar la operación y mostrar un mensaje de error indicando que el contenido de la nota es requerido

### Requirement 7: Tema Oscuro/Claro y Personalización Visual

**User Story:** Como usuario, quiero personalizar la apariencia visual de la app, para una experiencia de lectura cómoda en cualquier condición de luz.

#### Acceptance Criteria

1. THE Theme_Manager SHALL soportar dos modos visuales: tema claro y tema oscuro, ambos conformes con el sistema de color de Material 3, con tema claro como valor por defecto para nuevos usuarios
2. WHEN el usuario cambia el tema, THE Theme_Manager SHALL aplicar el cambio a todos los widgets visibles en un tiempo máximo de 500 milisegundos sin reiniciar la app
3. THE Theme_Manager SHALL persistir la preferencia de tema entre sesiones de la aplicación utilizando almacenamiento local
4. THE Settings_Screen SHALL permitir ajustar el tamaño de fuente del texto bíblico en un rango de 14sp a 28sp en incrementos de 2sp, con un valor por defecto de 18sp
5. THE Settings_Screen SHALL permitir seleccionar entre al menos 3 familias tipográficas para el texto bíblico, con la primera opción de la lista como valor por defecto
6. THE Theme_Manager SHALL persistir las preferencias de tamaño de fuente y familia tipográfica entre sesiones utilizando almacenamiento local
7. IF la lectura o escritura de preferencias visuales en almacenamiento local falla, THEN THE Theme_Manager SHALL aplicar los valores por defecto (tema claro, tamaño 18sp, familia tipográfica por defecto) y mostrar un mensaje indicando que no se pudieron cargar las preferencias guardadas

### Requirement 8: Compartir Versículos como Imagen

**User Story:** Como usuario, quiero compartir versículos como imágenes elegantes en redes sociales, para inspirar a otros con pasajes bíblicos.

#### Acceptance Criteria

1. WHEN el usuario solicita compartir un versículo, THE Share_Generator SHALL generar una imagen que contenga el texto completo del versículo (hasta 300 caracteres) y la referencia bíblica (libro, capítulo y número de versículo) posicionados con márgenes mínimos de 10% del ancho de la imagen en cada lado
2. THE Share_Generator SHALL generar la imagen en formato PNG con resolución de 1080x1080 píxeles
3. THE Share_Generator SHALL renderizar el texto del versículo con un tamaño de fuente mínimo de 24px, un ratio de contraste mínimo de 4.5:1 entre el texto y el fondo, y un fondo de color sólido o gradiente que ocupe el 100% del área de la imagen
4. WHEN la imagen está generada, THE App SHALL abrir el diálogo nativo de compartir de Android con la imagen lista para enviar
5. THE Share_Generator SHALL completar la generación de la imagen en menos de 2 segundos desde la solicitud del usuario
6. IF el texto del versículo excede 300 caracteres, THEN THE Share_Generator SHALL reducir el tamaño de fuente proporcionalmente hasta un mínimo de 18px para ajustar el texto completo dentro del área disponible de la imagen
7. IF la generación de la imagen falla o excede los 2 segundos, THEN THE App SHALL mostrar un mensaje de error al usuario e indicar la opción de reintentar la operación

### Requirement 9: Diseño UI/UX Premium Moderno

**User Story:** Como usuario, quiero una interfaz moderna, minimalista y premium, para disfrutar de una experiencia visual de alta calidad.

#### Acceptance Criteria

1. THE App SHALL implementar Material Design 3 con bordes redondeados (border-radius mínimo 12dp) y elevaciones entre 1dp y 6dp para generar profundidad visual
2. THE App SHALL utilizar una paleta de colores definida para tema claro y tema oscuro, cumpliendo un ratio de contraste mínimo de 4.5:1 para texto sobre fondo según WCAG 2.1 AA
3. THE Navigation_System SHALL implementar una barra de navegación inferior con 5 secciones: Home, Biblia, Búsqueda, Favoritos y Configuración
4. THE App SHALL implementar transiciones entre pantallas con duración entre 200ms y 400ms sin pérdida de frames (0 dropped frames durante la animación)
5. THE App SHALL utilizar tipografía jerárquica con al menos 3 niveles donde el título sea mínimo 20sp, el subtítulo mínimo 16sp y el cuerpo mínimo 14sp, con una diferencia mínima de 2sp entre niveles consecutivos
6. WHILE el usuario realiza scroll en el Bible_Reader, THE App SHALL mantener un rendimiento de renderizado de al menos 60fps sin caídas por debajo de 55fps durante más de 100ms consecutivos

### Requirement 10: Arquitectura Limpia y Escalable

**User Story:** Como desarrollador, quiero una arquitectura limpia y modular, para facilitar el mantenimiento y la escalabilidad futura.

#### Acceptance Criteria

1. THE App SHALL implementar Clean Architecture con separación en capas: data (repositorios, datasources, modelos), domain (entidades, repositorios abstractos, use cases) y presentation (screens, widgets, providers)
2. THE App SHALL organizar el código por features independientes: bible, search, favorites, notes, settings, home y share, donde cada feature contiene sus propias sub-carpetas data, domain y presentation sin importaciones directas de archivos pertenecientes a otra feature
3. THE App SHALL utilizar Riverpod como gestor de estado, donde todos los providers declaran tipo explícito de retorno y son definidos como inmutables (no utilizan StateProvider mutable)
4. THE App SHALL utilizar GoRouter para la navegación declarativa, donde todas las rutas se definen como clases tipadas con parámetros verificables en tiempo de compilación
5. THE App SHALL utilizar Hive como base de datos local para persistencia offline
6. THE App SHALL utilizar freezed para modelos de datos inmutables con generación de código
7. THE App SHALL mantener cada feature desacoplada, donde la comunicación entre features se realiza únicamente a través de clases abstractas o interfaces definidas en la capa domain, sin importaciones directas entre capas presentation o data de distintas features
8. THE App SHALL respetar la dirección de dependencias en cada feature: la capa presentation puede importar de domain, la capa data puede importar de domain, pero la capa domain no importa de data ni de presentation ni de paquetes externos al framework de Dart puro

### Requirement 11: Optimización de Rendimiento

**User Story:** Como usuario, quiero que la app sea rápida y eficiente, para una experiencia fluida sin consumo excesivo de recursos.

#### Acceptance Criteria

1. WHILE el usuario navega y lee capítulos en el Bible_Reader con un máximo de 1 libro abierto, THE App SHALL mantener un consumo de memoria RAM inferior a 150MB medido en un dispositivo con 3GB de RAM o superior
2. THE Bible_Reader SHALL renderizar únicamente los versículos visibles en el viewport más un buffer de 10 versículos adicionales por encima y por debajo del área visible
3. WHEN el usuario ejecuta una búsqueda de texto en el Search_Engine, THE Search_Engine SHALL retornar los resultados en un tiempo máximo de 500 milisegundos para cualquier término de búsqueda de hasta 100 caracteres
4. WHEN el usuario lanza la App desde un estado de cierre completo (cold start) en un dispositivo con 3GB de RAM o superior, THE App SHALL mostrar la Home_Screen lista para interacción en un tiempo máximo de 3 segundos
5. THE App SHALL ejecutar en isolates de Dart toda operación de cómputo que requiera más de 16 milisegundos de procesamiento, evitando bloquear el hilo principal de UI
6. WHILE el usuario realiza scroll en el Bible_Reader, THE App SHALL mantener una tasa de frames de al menos 58fps, sin que ningún frame individual exceda 20 milisegundos de tiempo de renderizado

### Requirement 12: Persistencia de Posición de Lectura

**User Story:** Como usuario, quiero que la app recuerde dónde dejé mi lectura, para continuar fácilmente donde lo dejé.

#### Acceptance Criteria

1. WHEN el usuario navega a un capítulo en el Bible_Reader, THE App SHALL guardar la Reading_Position (libro, capítulo, y primer versículo visible en el viewport) en almacenamiento local persistente en un máximo de 1 segundo tras la navegación
2. WHEN la App se inicia y existe una Reading_Position guardada, THE App SHALL mostrar en la pantalla Home una sección "Continuar Lectura" que indique el libro, capítulo y versículo de la última posición guardada, dentro de los primeros 2 segundos de carga de la pantalla Home
3. WHEN el usuario cambia de capítulo o el scroll se detiene por al menos 1 segundo habiendo avanzado más de 3 versículos desde la última posición guardada, THE App SHALL actualizar la Reading_Position con la nueva ubicación (libro, capítulo, primer versículo visible en viewport)
4. THE Reading_Position SHALL persistir entre sesiones sobreviviendo cierre de app, reinicio de dispositivo y actualizaciones de la app, sin requerir conexión a internet
5. IF la App se inicia y no existe una Reading_Position guardada previamente, THEN THE App SHALL ocultar la sección "Continuar Lectura" en Home y no mostrar error alguno
6. IF la Reading_Position guardada referencia un libro o capítulo no disponible en la Biblia instalada, THEN THE App SHALL descartar la posición inválida, ocultar la sección "Continuar Lectura", y navegar al inicio del primer libro disponible cuando el usuario intente continuar lectura
