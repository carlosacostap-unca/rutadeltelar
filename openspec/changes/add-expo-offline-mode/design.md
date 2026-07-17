## Context

La aplicación pública es un proyecto Next.js 16 que obtiene contenido aprobado y archivos desde PocketBase, con datos mock como fallback. La navegación principal también usa recursos remotos para imágenes, capas satelitales, cálculo vial, métricas y algunos iconos o enlaces. En la exposición se ejecutará sobre una notebook Windows con conectividad no confiable y debe arrancar en frío, navegar el catálogo real y mostrar multimedia y territorio sin esperar timeouts.

El modo conectado continuará usando PocketBase como fuente de verdad. La edición de exposición será una copia de solo lectura preparada previamente y no deberá incluir credenciales administrativas ni modificar datos remotos.

## Goals / Non-Goals

**Goals:**

- Ejecutar toda la navegación principal en una notebook Windows sin conexión.
- Mostrar una instantánea representativa y verificable del contenido público aprobado, con su multimedia optimizada.
- Conservar búsqueda, filtros, detalles, favoritos, agenda, mapas y recorridos útiles durante la exposición.
- Evitar intentos de red y demoras por timeout cuando el modo offline está activo.
- Producir un paquete reproducible, validado y fácil de iniciar por personal no técnico.
- Mantener intacto el comportamiento conectado y preservar PocketBase como fuente de verdad.

**Non-Goals:**

- Reescribir la interfaz con controles nativos de Windows.
- Permitir edición, alta o sincronización bidireccional de contenido durante la exposición.
- Replicar PocketBase completo ni incluir cuentas o credenciales administrativas.
- Garantizar el funcionamiento de WhatsApp, redes sociales, YouTube, Google Maps u otros destinos externos sin Internet.
- Servir inicialmente la experiencia a teléfonos conectados a una red local; podrá incorporarse como una extensión posterior.
- Crear en esta etapa un instalador firmado para distribución pública general.

## Decisions

### 1. Modo offline explícito en lugar de detectar fallas de red

Una variable de servidor, `RUTA_EXPO_OFFLINE=true`, seleccionará la fuente local desde el arranque. La configuración se centralizará para que datos, imágenes, mapas, métricas y acciones externas apliquen el mismo modo. No se intentará primero PocketBase porque una conexión degradada puede tardar en fallar y volver impredecible la demostración.

**Alternativa considerada:** reutilizar el fallback automático actual. Se descarta porque los mocks son incompletos y porque exige esperar fallas de red antes de degradar.

### 2. Instantánea materializada, inmutable y con versión de esquema

Un script de preparación conectado leerá todas las colecciones públicas necesarias con el mismo filtro de aprobación que la aplicación, normalizará relaciones y producirá un manifiesto JSON. El manifiesto contendrá versión de esquema, fecha de generación, origen no secreto, conteos por entidad, hashes e inventario de archivos. La aplicación offline leerá exclusivamente esa instantánea; no levantará una copia local de PocketBase.

El generador fallará si encuentra slugs duplicados, relaciones inválidas, entidades mínimas vacías o archivos requeridos que no pudieron descargarse. Los datos mock seguirán sirviendo para desarrollo y pruebas existentes, pero no serán la fuente del paquete de exposición.

**Alternativa considerada:** ejecutar PocketBase localmente. Se descarta para la primera versión porque agrega un proceso, migraciones, archivos de datos y una superficie operativa innecesaria para una copia de solo lectura.

### 3. Multimedia optimizada incluida en el paquete

Durante la preparación se descargarán las variantes adecuadas de portada y galería, conservando los originales remotos. El manifiesto reemplazará cada URL de PocketBase por una ruta local estable. Los archivos se deduplicarán por contenido y se validarán mediante hash. El paquete podrá excluir videos no seleccionados o generar variantes de exhibición con límites configurables, pero nunca eliminará ni reemplazará archivos en PocketBase.

Los artefactos pesados generados se tratarán como salida de distribución versionada por manifiesto y no necesariamente como archivos fuente permanentes de Git.

**Alternativa considerada:** confiar en la caché del navegador o del proxy `/api/media-image`. Se descarta porque una caché no garantiza cobertura completa después de un arranque en frío.

### 4. Cartografía offline acotada al relato de la exposición

Leaflet y los controles actuales se conservarán, pero en modo exposición usarán recursos locales. La primera implementación incluirá un mapa base georreferenciado y empaquetado para los límites de la Ruta del Telar, marcadores con iconos locales y recorridos precalculados en GeoJSON. No se consultarán capas ArcGIS, el servicio OSRM ni `unpkg`.

Esta solución prioriza confiabilidad y tamaño controlado frente a zoom cartográfico ilimitado. La fuente del mapa base deberá permitir distribución offline y conservar su atribución. Si más adelante se requiere mayor nivel de detalle, el proveedor podrá sustituirse por un paquete MBTiles o equivalente sin cambiar el contrato de la UI.

**Alternativa considerada:** precargar teselas visitando las pantallas. Se descarta por cobertura incierta y posibles restricciones de uso de los servidores públicos de teselas.

### 5. Distribución portable de Next.js

Se generará una salida `standalone` de Next.js y se copiarán `public` y `.next/static` al paquete. El paquete incluirá un runtime Node compatible y un lanzador Windows que:

1. active `RUTA_EXPO_OFFLINE=true`;
2. inicie el servidor ligado solo a `127.0.0.1`;
3. espere un endpoint de salud local;
4. abra Microsoft Edge en modo aplicación o pantalla completa;
5. informe claramente si el servidor no puede iniciar.

Esto reutiliza la aplicación y sus Route Handlers sin forzar una exportación estática incompatible con la búsqueda dinámica, el optimizador de imágenes y endpoints actuales.

### 6. Servicios secundarios con degradación explícita

En modo exposición, las métricas no escribirán en PocketBase y responderán localmente sin error. Las acciones que requieren destinos externos se marcarán como no disponibles sin conexión o se ocultarán según el contexto. Favoritos, búsqueda, filtros y exportación ICS continuarán funcionando localmente.

### 7. Verificación sin red como criterio de entrega

La suite E2E levantará el paquete con el modo exposición activo y bloqueará toda solicitud que no apunte a `localhost` o a recursos `data:`/`blob:`. Las pruebas recorrerán home, listados, búsqueda, detalles, favoritos, agenda, mapas y recorridos. También se validarán el manifiesto, los hashes, las referencias de archivos y un arranque en frío del paquete Windows.

## Risks / Trade-offs

- **El contenido queda desactualizado después de generar el paquete** → mostrar la fecha de la instantánea en un diagnóstico discreto y regenerarla antes de la exposición.
- **El paquete puede crecer demasiado por imágenes, videos o mapas** → usar presupuestos configurables, variantes optimizadas, deduplicación e informe de tamaño antes de empaquetar.
- **Una referencia remota puede quedar escondida en CSS o un componente** → bloquear red en E2E y fallar ante cualquier solicitud no local durante los recorridos de aceptación.
- **La cartografía simplificada ofrece menos zoom o detalle** → seleccionar límites y resolución según el guion del stand y conservar marcadores y rutas interactivas.
- **Microsoft Edge o el puerto local pueden no estar disponibles** → comprobarlos en el lanzador, seleccionar un puerto libre dentro de un rango acotado y documentar un arranque manual de contingencia.
- **Windows Defender puede advertir sobre ejecutables no firmados** → comenzar con scripts y accesos directos transparentes; evaluar firma solo si se crea un instalador público.
- **El generador podría incorporar contenido no aprobado o secretos** → reutilizar filtros públicos, aplicar una lista permitida de campos y analizar el artefacto antes de distribuirlo.

## Migration Plan

1. Añadir configuración central del modo exposición sin cambiar el modo conectado predeterminado.
2. Implementar el generador y validar una primera instantánea contra PocketBase.
3. Integrar la fuente de datos y multimedia local detrás del selector de modo.
4. Sustituir dependencias cartográficas y secundarias cuando el modo esté activo.
5. Crear y probar el paquete standalone y el lanzador en una carpeta separada.
6. Ejecutar pruebas automáticas con red bloqueada y una prueba manual con adaptadores de red deshabilitados.
7. Conservar como rollback el despliegue web y los comandos actuales; eliminar el paquete offline no afecta datos ni infraestructura remota.

## Open Questions

- Definir el límite geográfico, la resolución y la fuente con licencia compatible para el mapa base de exposición.
- Confirmar si se incluirán videos completos, versiones comprimidas o solo imágenes de portada.
- Confirmar si la primera entrega se ejecutará en una única notebook conocida o debe ser portable entre varias computadoras Windows.
- Definir la fecha límite de congelamiento del contenido y quién ejecutará la regeneración final antes del evento.

## Decision Amendment: Detailed vector basemap with schematic fallback

La base esquemática georreferenciada se conservará como respaldo, pero la experiencia principal de exposición usará un recorte regional PMTiles de Protomaps Basemap derivado de OpenStreetMap. La integración reutilizará Leaflet y `protomaps-leaflet` porque los mapas existentes dependen de sus marcadores, popups, filtros, controles y polilíneas. El archivo PMTiles se servirá exclusivamente desde el servidor Next.js incluido en localhost y mantendrá la atribución requerida.

El recorte cubrirá con margen todas las coordenadas y geometrías de recorridos de la instantánea, con un nivel máximo de zoom acotado por presupuesto. Si el archivo PMTiles falta, es inválido o no puede renderizarse, la aplicación volverá al SVG local existente sin intentar un proveedor remoto. La preparación y la aceptación registrarán tamaño, cobertura, metadatos y ausencia de solicitudes externas.
