# Video promocional Ruta del Telar

Composicion Remotion para un video institucional/demo del catalogo publico.

## Comandos

1. Levantar la app publica:

```powershell
npm.cmd run dev -- -H 127.0.0.1 -p 3107
```

2. Capturar pantallas reales:

```powershell
$env:PROMO_BASE_URL='http://127.0.0.1:3107'
npm.cmd run video:screenshots
```

3. Previsualizar en Remotion Studio:

```powershell
npm.cmd run video:dev
```

4. Renderizar el MP4:

```powershell
npm.cmd run video:render -- --overwrite
```

El video final se escribe en `public/video/ruta-del-telar-promo.mp4`.
Las capturas usadas por la composicion quedan en `public/video/screenshots/`.
