## Why

La aplicación debe poder demostrarse de forma completa y predecible en una exposición donde la conectividad a Internet será débil o inexistente. El fallback local actual permite continuar ante fallas de PocketBase, pero no contiene el catálogo, la multimedia ni la cartografía necesarios para una demostración representativa.

## What Changes

- Sustituir la aceptación dependiente de una notebook específica por autodiagnóstico de integridad, bloqueo de red verificable y pruebas portables repetibles, conservando una comprobación manual final en cualquier equipo Windows disponible.

- Incorporar un modo explícito `Expo Offline` que omita toda solicitud remota necesaria para navegar la demostración.
- Generar, validar y versionar como artefacto de distribución una instantánea local del contenido público aprobado obtenido desde PocketBase.
- Descargar y referenciar copias locales optimizadas de las imágenes y demás multimedia incluidas en la instantánea.
- Proveer una experiencia cartográfica offline para la zona de la Ruta del Telar y recorridos precalculados, sin depender en tiempo de ejecución de ArcGIS, OSRM o CDN de iconos.
- Desactivar o degradar de manera controlada métricas y acciones externas durante la exposición, sin bloquear la navegación principal.
- Distribuir la aplicación como servidor Next.js local con un lanzador para Windows que abra la experiencia en modo aplicación o pantalla completa.
- Mantener el funcionamiento web conectado existente como modo predeterminado; el modo de exposición será opt-in y no reemplazará PocketBase como fuente de verdad.
- Añadir verificaciones automatizadas y una prueba de aceptación con la conectividad del equipo completamente desactivada.

## Capabilities

### New Capabilities

- `expo-offline-runtime`: Ejecución, distribución y validación de una edición de exposición que funciona sin conectividad y puede iniciarse desde Windows.

### Modified Capabilities

- `content-data`: Añadir una instantánea local completa y validada como fuente de lectura exclusiva cuando se activa el modo Expo Offline, incluyendo referencias a multimedia local.
- `search-and-map`: Mantener búsqueda y exploración geográfica disponibles sin teselas, rutas, iconos ni otros recursos cartográficos remotos.

## Impact

- Afecta la selección de fuente de datos en `app/lib/data.ts` y la configuración de PocketBase.
- Requiere un generador de instantáneas ejecutado antes de la exposición, manifiestos de contenido y almacenamiento de multimedia optimizada dentro del paquete offline.
- Afecta los componentes Leaflet, las capas cartográficas, el cálculo de recorridos, el proxy de imágenes y el registro de métricas.
- Añade scripts de preparación, validación, empaquetado y arranque para Windows, además de documentación operativa para el stand.
- Puede aumentar de forma significativa el tamaño del artefacto distribuible según la cantidad de imágenes, videos y cartografía seleccionada.
- No modifica PocketBase ni elimina o reemplaza los archivos originales existentes.
