# Ruta del Telar

Aplicacion publica de la Ruta del Telar de Catamarca, construida con Next.js.

## Desarrollo

```bash
npm install
npm run dev
```

El servidor de desarrollo usa el puerto `3000` por defecto:

```text
http://localhost:3000
```

Si ese puerto esta ocupado, se puede indicar otro:

```bash
npm run dev -- --port 3001
```

## Verificacion

Antes de publicar o abrir un PR, correr la verificacion completa:

```bash
npm run verify
```

Ese comando ejecuta, en orden:

- `npm run openspec:validate`
- `npm run lint`
- `npm run build`
- `npm run test:playwright`

Para una pasada mas corta durante desarrollo:

```bash
npm run verify:quick
```

La version rapida ejecuta OpenSpec, lint y build, pero salta Playwright.

## OpenSpec

El proyecto usa OpenSpec para mantener requisitos y cambios propuestos en `openspec/`.

```bash
npm run openspec:list
npm run openspec:validate
```

Las specs actuales viven en `openspec/specs/`. Para proponer una nueva funcionalidad con Codex, usar el flujo de OpenSpec antes de implementar el cambio.

## Pruebas E2E

```bash
npm run test:playwright
```

Las pruebas levantan un servidor Next en `http://localhost:3211` y desactivan PocketBase para usar los datos locales de fallback.

## Datos

El sitio puede leer desde PocketBase cuando las variables correspondientes estan configuradas. Si no hay conexion o no hay variables, usa datos locales para mantener la experiencia publica disponible.
