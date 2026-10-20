# NestJS API Bridge

Explora los endpoints de tu API NestJS desde VS Code y genera clientes tipados sin levantar el servidor ni mantener un spec OpenAPI.

![Demo de NestJS API Bridge](https://raw.githubusercontent.com/javiermorenodev/nestjs-api-bridge/main/docs/demo.gif)

## Características

- Árbol de endpoints en la barra de actividad, agrupado por controlador.
- Servicio Angular (`@Injectable`) con un método por endpoint.
- Servicio TypeScript basado en `fetch` con hooks de React y React Native.
- Composable de Vue (`useXxx`) sobre el mismo servicio `fetch`.
- Cliente de API Flutter (Dio) y modelos Dart.
- Modelos TypeScript/Dart generados a partir de tus DTOs.
- Abrir el handler, copiar la URL y copiar un `cURL` desde el menú contextual.

## Uso

1. Abre un workspace que contenga archivos `*.controller.ts`.
2. Despliega **NestJS API Bridge** en la barra de actividad.
3. Haz clic derecho sobre un endpoint y elige el cliente a generar.
4. Selecciona la carpeta destino; se generan el servicio, el wrapper y los modelos.

Atajos (con un endpoint enfocado en el árbol): `Ctrl+Alt+A` Angular, `Ctrl+Alt+R` React, `Ctrl+Alt+N` React Native, `Ctrl+Alt+F` Flutter, `Ctrl+Alt+V` Vue. En macOS usa `Cmd` en lugar de `Ctrl`.

## Configuración

| Opción                    | Tipo   | Por defecto             | Descripción                                                                 |
| ------------------------- | ------ | ----------------------- | --------------------------------------------------------------------------- |
| `nestjsApiBridge.baseUrl` | string | `http://localhost:3000` | URL base para copiar URL/cURL y para el `BASE_URL` de los clientes `fetch`. |

## Requisitos

- VS Code 1.90 o superior.
- Un proyecto NestJS con controladores en el workspace.

## Desarrollo

```bash
npm install
npm run build
```

Pulsa `F5` para lanzar la extensión en modo desarrollo. Más detalles en el [repositorio](https://github.com/javiermorenodev/nestjs-api-bridge).

## Licencia

MIT
