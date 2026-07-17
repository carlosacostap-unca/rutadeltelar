## Why

Quienes visitan Ruta del Telar desde teléfonos y tablets hoy deben volver a encontrar y abrir el sitio en el navegador. Una experiencia web instalable les permitirá conservar un acceso directo reconocible y abrir la aplicación con mayor rapidez desde la pantalla de inicio o el menú de aplicaciones.

## What Changes

- Hacer que la aplicación pública cumpla los requisitos de instalación como PWA, con nombre, colores, modo de visualización e íconos propios.
- Ofrecer una invitación de instalación contextual en navegadores compatibles, sin interrumpir la navegación ni volver a mostrarse cuando la aplicación ya está instalada.
- Proporcionar instrucciones específicas para instalar desde Safari en iPhone y iPad, donde no existe un diálogo programático equivalente.
- Registrar un service worker acotado que aporte una experiencia de inicio resistente sin interferir con los datos dinámicos ni con el modo Expo existente.
- Incorporar pruebas automatizadas de los metadatos y estados principales de la experiencia de instalación.

## Capabilities

### New Capabilities

- `installable-web-app`: Instalación de Ruta del Telar desde dispositivos móviles y tablets, incluyendo descubrimiento, experiencia por plataforma y apertura en modo aplicación.

### Modified Capabilities


## Impact

- Afecta el layout raíz, el shell visual y los recursos públicos de la aplicación Next.js.
- Agrega un manifiesto web, íconos de instalación, service worker y componentes cliente asociados.
- No cambia las APIs públicas, el modelo de datos ni las dependencias externas.
- Debe conservar el comportamiento especial del modo Expo y las modificaciones locales ajenas a este cambio.
