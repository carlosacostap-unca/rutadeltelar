## Context

Ruta del Telar es una aplicación Next.js 16 responsive que ya dispone de una navegación móvil y un modo Expo separado para entregar una instantánea offline. No publica todavía un manifiesto web, íconos de aplicación, service worker ni interfaz de instalación. El cambio debe limitarse a la aplicación web.

## Goals / Non-Goals

**Goals:**

- Permitir que los navegadores compatibles instalen la aplicación web con una identidad visual consistente.
- Presentar una acción clara y no intrusiva en Android y una guía específica en Safari para iPhone y iPad.
- Evitar mostrar la invitación si la aplicación ya está instalada, si el usuario la descartó o cuando se usa el modo Expo offline.
- Aportar un fallback de navegación limitado mediante un service worker sin almacenar respuestas de contenido dinámico.

**Non-Goals:**

- No crear una aplicación nativa ni modificar el empaquetado offline existente.
- No añadir notificaciones push, sincronización en segundo plano ni una descarga completa de contenidos para uso offline.
- No modificar las fuentes de datos ni las APIs existentes.

## Decisions

### Usar las convenciones de metadata de Next.js

Se incorporarán `app/manifest.ts`, `app/icon.tsx` y `app/apple-icon.tsx`, que son rutas de metadata soportadas por Next.js 16. Esto evita gestionar etiquetas HTML manualmente y genera íconos PNG optimizados durante el build. Como alternativa se consideró guardar imágenes estáticas bajo `public`, pero los generadores mantienen el diseño y los tamaños bajo control de código sin depender de herramientas de edición externas.

### Implementar el flujo de instalación como componente cliente aislado

Un componente dentro de `AppShell` registrará el service worker y mantendrá el evento `beforeinstallprompt` cuando esté disponible. En Android y otros navegadores compatibles mostrará un banner con una acción explícita; Safari en iOS/iPadOS recibirá una guía de dos pasos. El banner se ubicará sobre la navegación móvil y respetará la zona segura. Mantener esta lógica aislada evita convertir el layout raíz en cliente.

### Tratar los estados del usuario de forma local y conservadora

El componente comprobará el modo standalone y registrará una preferencia de descarte en `localStorage`. El descarte durará 30 días, se limpiará al completar una instalación y no se persistirá ninguna información personal. Se muestra una guía Safari solo en dispositivos Apple móviles y fuera de modo standalone. Se evaluó mostrar una invitación en cada visita, pero resultaría molesto y reduciría la probabilidad de instalación.

### Cachear solo la navegación de aplicación

El service worker usará una estrategia de red primero para documentos de navegación y una página offline mínima como fallback. No interceptará imágenes, APIs, archivos de PocketBase ni solicitudes del modo Expo para no provocar contenido desactualizado ni duplicar su mecanismo de distribución. Se eligió un worker pequeño sin dependencias sobre Workbox para mantener el cambio autocontenido y evitar ampliar el bundle.

## Risks / Trade-offs

- [El navegador puede no exponer `beforeinstallprompt`] → Se muestra el banner de instalación únicamente cuando el evento está disponible; iOS/iPadOS recibe instrucciones manuales.
- [Safari varía la ubicación de sus controles entre versiones] → La guía usa términos reconocibles (Compartir y “Agregar a pantalla de inicio”) y no depende de una posición fija.
- [La caché puede entregar una versión obsoleta] → El worker usa una versión explícita, elimina cachés antiguas y prioriza la red.
- [El banner puede cubrir controles en pantallas pequeñas] → Se ubica encima de la navegación inferior y puede cerrarse con una acción accesible.
- [La PWA requiere HTTPS en producción] → La verificación de entrega incluirá una prueba sobre el despliegue HTTPS; el registro se omite de forma segura si el navegador no lo permite.

## Migration Plan

1. Desplegar el manifiesto, íconos, worker y experiencia de instalación juntos en HTTPS.
2. Verificar la instalación en Chrome Android y la guía en Safari de iPhone/iPad.
3. Si se detecta un problema, retirar el registro del worker o reemplazar el archivo `sw.js`; las cachés versionadas se eliminarán en la siguiente activación.

## Open Questions

- Ninguna para la primera versión: se usará la identidad cromática existente y no se incorporarán funciones adicionales de offline o notificaciones.
