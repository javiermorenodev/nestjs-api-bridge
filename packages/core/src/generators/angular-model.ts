import type { DtoSpec } from '../models/index.js';
import { getTemplate } from './template.js';

/**
 * Genera una interface TypeScript a partir de un DtoSpec.
 *
 * @param dto Especificación de un DTO extraído del proyecto NestJS.
 * @returns El código fuente TypeScript de la interface.
 */
export function generateAngularModel(dto: DtoSpec): string {
  return `${getTemplate('angular-model.hbs')({
    name: dto.name,
    properties: dto.properties,
  }).trimEnd()}\n`;
}
