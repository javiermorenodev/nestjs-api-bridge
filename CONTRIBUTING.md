# Contribuir a NestJS API Bridge

Gracias por tomarte el tiempo de contribuir. Esta guía cubre el entorno, los comandos y el flujo de trabajo del repositorio.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior (el proyecto usa npm workspaces).

## Puesta en marcha

```bash
git clone git@github.com:javiermorenodev/nestjs-api-bridge.git
cd nestjs-api-bridge
npm install
npm run build
```

`npm install` instala todas las dependencias del monorepo. `npm run build` compila el core y empaqueta la extensión.

## Estructura del monorepo

```text
packages/
  core/    Parser (ts-morph) y generadores (Handlebars). Sin dependencias de VS Code.
  vscode/  Extensión: árbol de endpoints, comandos y empaquetado con esbuild.
examples/
  nestjs-demo/  Proyecto NestJS mínimo usado como fixture manual.
```

El core es agnóstico de la plataforma. La extensión consume `@nestjs-api-bridge/core` y no debe contener lógica de parsing ni de generación.

## Comandos

Todos se ejecutan desde la raíz.

| Comando                | Descripción                         |
| ---------------------- | ----------------------------------- |
| `npm run build`        | Compila todos los workspaces.       |
| `npm run typecheck`    | Comprueba tipos sin emitir.         |
| `npm test`             | Ejecuta la suite de Vitest una vez. |
| `npm run test:watch`   | Ejecuta Vitest en modo watch.       |
| `npm run coverage`     | Genera el informe de cobertura.     |
| `npm run lint`         | Ejecuta ESLint.                     |
| `npm run lint:fix`     | ESLint con autofix.                 |
| `npm run format`       | Formatea con Prettier.              |
| `npm run format:check` | Verifica el formato sin escribir.   |

Para un workspace concreto, usa `npm run <script> -w <paquete>`, por ejemplo `npm run build -w @nestjs-api-bridge/core`.

## Flujo de trabajo

1. Crea una rama desde `main`: `feat/...`, `fix/...`, `docs/...`.
2. Implementa el cambio y añade o actualiza los tests.
3. Asegúrate de que todo pasa en local:

   ```bash
   npm run lint
   npm run format:check
   npm run typecheck
   npm test
   ```

4. Abre un pull request usando la plantilla del repositorio.

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. El asunto en imperativo y en una sola línea.

## Estilo de código

- TypeScript estricto. No uses `any` sin una razón justificada.
- Prettier manda: comillas simples, punto y coma, ancho 100, coma final.
- ESLint debe quedar sin errores. Los imports de solo tipo usan `import type`.
- El código de los ejemplos (`examples/**`) relaja la regla `consistent-type-imports` por compatibilidad con la inyección de dependencias de NestJS.

## Tests

- Cada parser y generador vive junto a su test (`*.test.ts`) en `packages/core/src`.
- Los tests de generadores usan snapshots. Si cambias una plantilla a propósito, actualízalos con `npm test -- -u`.
- Para reproducir el parser a mano, apunta a `examples/nestjs-demo`:

  ```ts
  import { parseNestProject, extractDto } from '@nestjs-api-bridge/core';

  const spec = parseNestProject('examples/nestjs-demo');
  const dto = extractDto('examples/nestjs-demo', 'CreateUserDto');
  ```

## Añadir un generador

1. Crea `packages/core/src/generators/<framework>.ts` con la función `generate...`.
2. Añade su plantilla en `packages/core/src/generators/templates/<framework>.hbs`.
3. Exporta la función desde `packages/core/src/index.ts`.
4. Añade tests con snapshot del resultado.
5. Si tiene comando en VS Code, regístralo en `packages/vscode/src/extension.ts` y en `contributes` de `packages/vscode/package.json`.

## Reportar bugs y proponer ideas

Abre un issue con pasos para reproducir, comportamiento esperado y real, y la versión de NestJS/VS Code. Para propuestas, describe el caso de uso antes de la solución.

## Licencia

Al contribuir, aceptas que tus aportes se publiquen bajo la licencia [MIT](./LICENSE).
