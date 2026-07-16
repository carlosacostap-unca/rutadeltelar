# Relevamiento de seguridad y carga - 2026-07-08

Alcance: proyecto publico `rutadeltelar` en el workspace local. Las pruebas de carga se hicieron solo contra `127.0.0.1`; no se envio carga a produccion ni a PocketBase remoto.

## Dependencias

- `npm audit` inicial: 5 vulnerabilidades, con 1 alta en `next@16.2.4`.
- Accion aplicada: actualizacion compatible de `next` y `eslint-config-next` a `^16.2.10`, seguida de `npm audit fix` sin `--force`.
- Estado final: 2 vulnerabilidades moderadas, ambas por `next -> postcss@8.4.31`.
- No se aplico `npm audit fix --force` porque npm propone instalar `next@9.3.3`, un cambio mayor y regresivo para esta aplicacion.

## Puertos locales abiertos

Puertos relevantes observados en la maquina local:

| Puerto | Bind | Proceso | Observacion |
| --- | --- | --- | --- |
| 135 | `0.0.0.0` / `::` | `svchost` | Windows RPC |
| 139 | `192.168.1.7` | `System` | NetBIOS/SMB |
| 445 | `::` | `System` | SMB |
| 3002 | `0.0.0.0` | `node` | Remotion Studio local, respondio HTTP 200 |
| 5040 | `0.0.0.0` | `svchost` | Servicio Windows |
| 7680 | `::` | `svchost` | Delivery Optimization |
| 49664-49670 | varios | servicios Windows | Puertos dinamicos/RPC |
| 58374 | `::` | `node` | Asociado al proceso Node de Remotion |

No quedo escuchando el puerto `3107` usado temporalmente para la prueba de carga.

## Prueba de carga local

Se agrego `npm run load:test`, implementado en `scripts/load-test.mjs`.

Caracteristicas:

- Sin dependencias nuevas.
- Por defecto solo permite targets locales (`localhost`, `127.0.0.1`, `::1`).
- Configurable con `LOAD_TEST_URL`, `LOAD_TEST_REQUESTS`, `LOAD_TEST_CONCURRENCY` y `LOAD_TEST_TIMEOUT_MS`.

Corrida de humo:

- Target: `http://127.0.0.1:3107/`
- Requests: 50
- Concurrencia: 5
- Resultado: 50 respuestas `200`, 0 fallos
- Throughput: 2.91 req/s
- Latencias: p50 1067 ms, p95 9064 ms, p99 9105 ms

Nota: se ejecuto contra `next dev`, por eso las latencias altas incluyen compilacion bajo demanda. Para medicion de capacidad real, usar build + start local.

## Rutas y configuraciones revisadas

- `.env.local` solo expone `NEXT_PUBLIC_POCKETBASE_URL`; no se imprimieron secretos.
- `app/api/media-image/route.ts` restringe el proxy de imagenes al host configurado de PocketBase y a `/api/files/`, con limite de 20 MB, timeout y validacion de content-type.
- `app/api/metrics/view/route.ts` es una ruta publica que autentica contra PocketBase con credenciales administrativas para registrar metricas. El payload esta acotado, pero no hay rate limit persistente ni verificacion local de origen/entidad antes de escribir.
- Este repo publico no contiene panel administrativo propio; el panel/configuracion real vive fuera de este repo, en el admin/PocketBase.

## Riesgos pendientes

1. `next -> postcss@8.4.31` queda reportado como moderado por `npm audit`. Conviene actualizar Next cuando publique una version estable que no empaquete esa version de PostCSS, o evaluar un parche oficial de Next si aparece.
2. `/api/metrics/view` puede ser abusado para inflar metricas o generar escrituras a PocketBase. Recomendado: validar existencia de entidad, agregar rate limit por IP/visitor, cachear token administrativo y/o mover la escritura a una regla menos privilegiada.
3. Puertos Windows `139/445` estan visibles en la red local. Si esta maquina no necesita compartir archivos en esa red, conviene restringirlos con firewall/perfil de red.
4. El escaneo Codex Security quedo iniciado, pero el preflight no pudo confirmar capacidad multiagente suficiente para llamarlo exhaustivo. El relevamiento de este documento es local y acotado.

## Verificaciones

- `npm run test:unit`: 22 tests OK.
- `npm run build`: OK, 173 paginas estaticas generadas.
- `npm audit`: 2 moderadas restantes, sin altas ni criticas.
