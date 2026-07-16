# Ruta del Telar - Expo Offline

## Preparacion antes del evento

1. Con Internet estable y acceso a PocketBase, ejecutar `npm run expo:prepare`.
2. Cuando sea necesario actualizar la cartografía, descargar la herramienta oficial `pmtiles` para Windows y ejecutar `npm run expo:map:prepare -- --cli=RUTA\pmtiles.exe --source=https://build.protomaps.com/AAAAMMDD.pmtiles --maxzoom=15`.
3. Revisar `public/expo/report.txt` y `public/expo/map/ruta-del-telar.pmtiles.json`: conteos, archivos, bytes, cobertura, zoom y hashes.
4. Ejecutar `npm run expo:verify` para validar código, modo conectado y modo offline.
5. Ejecutar `npm run expo:build` para crear el paquete versionado dentro de `output/`.
6. Ejecutar `npm run expo:smoke` para probar el arranque frío del paquete.

La instantánea utiliza únicamente registros aprobados y campos ya normalizados para la experiencia pública. Las imágenes de PocketBase se copian con nombre basado en SHA-256; los originales remotos no se modifican.

## Mapa incluido

La edición principal usa un recorte vectorial Protomaps PMTiles derivado de OpenStreetMap. El archivo actual cubre aproximadamente `[-28.2, -67.95]` / `[-25.5, -65.5]`, llega hasta zoom 15 y ocupa cerca de 20 MB. Deben conservarse las atribuciones `Protomaps` y `© OpenStreetMap contributors`; la fuente se distribuye como Produced Work bajo ODbL.

El SVG esquemático local permanece detrás de la capa vectorial y actúa como respaldo automático si el archivo PMTiles falta o no puede abrirse. Los marcadores, filtros, popups y recorridos continúan siendo capas locales de Leaflet. Los recorridos se calculan durante la preparación y se guardan como geometría local; si OSRM no responde durante esa preparación conectada, se guarda una línea directa entre puntos.

## Inicio portable recomendado (Electron)

1. Copiar y descomprimir `ruta-del-telar-expo-electron-...-win32-x64.zip` en cualquier computadora Windows x64 compatible.
2. Comparar el SHA-256 del ZIP con el archivo `.zip.sha256` entregado junto al paquete.
3. Hacer doble clic en `RutaDelTelarExpo.exe`; no requiere instalación, Edge, reinicio, privilegios administrativos ni desactivar la conectividad.
4. Esperar mientras la pantalla de inicio con la vicuña informa las etapas de verificación, preparación del servidor, carga de contenidos y apertura. La ventana principal se abrirá a pantalla completa sólo si el paquete es válido.
5. Cerrar la ventana para detener también el servidor local.

Electron incluye Chromium y aplica una política interna que cancela todas las solicitudes HTTP(S), ventanas nuevas y navegaciones que no apunten al servidor incluido en `127.0.0.1`. Wi-Fi o Ethernet pueden permanecer activos. El ejecutable, la barra de tareas y la pantalla de inicio usan el ícono de la vicuña de Ruta del Telar. Si Windows SmartScreen advierte que el ejecutable no está firmado, comprobar primero el SHA-256 entregado y usar únicamente la copia validada por el equipo del proyecto.

## Inicio de contingencia con Edge

1. Copiar la carpeta completa del paquete al disco local de la notebook.
2. Hacer doble clic en `start-expo.cmd`.
3. Esperar el control de salud; Edge abrirá una ventana exclusiva a pantalla completa.
4. Cerrar esa ventana de Edge para detener también el servidor local.

El lanzador usa solamente `127.0.0.1`, busca un puerto entre 3210 y 3220, evita reutilizar procesos previos y guarda registros junto al paquete.

## Inicio manual de contingencia

```powershell
$env:RUTA_EXPO_OFFLINE='true'
$env:HOSTNAME='127.0.0.1'
$env:PORT='3210'
Set-Location app
..\runtime\node.exe server.js
```

Luego abrir `http://127.0.0.1:3210`. El diagnóstico está en `/api/expo/health`.

## Checklist portable

- Mantener la conectividad de Windows en su estado normal; no es necesario reiniciar ni modificar adaptadores.
- Iniciar con `RutaDelTelarExpo.exe`.
- Recorrer inicio, catálogos, búsqueda, favoritos, agenda, mapa y recorrido sugerido.
- Abrir un detalle representativo de cada tipo y confirmar que no hay imágenes rotas ni esperas de red.
- Confirmar que WhatsApp, mapas externos, redes sociales y otras salidas no abren ventanas ni realizan solicitudes desde la aplicación.
- Cerrar Electron y confirmar que la aplicación puede abrirse nuevamente sin conflictos.
- Como prueba opcional de máxima exigencia, repetir una vez con la conectividad física desactivada; no es un requisito operativo.

## Recuperacion y actualización

- Si el inicio falla, revisar `expo-server.err.log` y el endpoint `/api/expo/health`.
- Para actualizar contenido, repetir `expo:prepare`, verificar el informe y construir un paquete nuevo. No editar `snapshot.json` manualmente.
- Para actualizar caminos, localidades o referencias cartográficas, ejecutar después `expo:map:prepare` contra una compilación oficial fechada de Protomaps, revisar el JSON de metadatos y repetir la validación completa.
- Mantener dos copias verificadas del paquete y comparar `PACKAGE-SHA256.txt` antes del evento.
