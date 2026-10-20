import type { ControllerSpec } from '../models/index.js';
import { toKebabCase } from '../utils/case.js';
import { getTemplate } from './template.js';
import { controllerBaseName } from './ts-utils.js';

function toServiceFile(controller: ControllerSpec): string {
  return `${toKebabCase(controllerBaseName(controller.name))}.service`;
}

/**
 * Genera un composable de Vue (`ref`) sobre un servicio `fetch`.
 *
 * @param controller Controlador NestJS previamente parseado.
 * @returns El código fuente TypeScript con el composable.
 */
export function generateVueComposable(controller: ControllerSpec): string {
  const methodLines = controller.endpoints
    .map(
      (endpoint) =>
        `    ${endpoint.name}: (...args: Parameters<typeof service.${endpoint.name}>) => run(() => service.${endpoint.name}(...args)),\n`,
    )
    .join('');

  return `${getTemplate('vue-composable.hbs')({
    base: controllerBaseName(controller.name),
    serviceFile: toServiceFile(controller),
    methodLines,
  }).trimEnd()}\n`;
}
