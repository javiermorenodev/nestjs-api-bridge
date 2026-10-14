import type { ParamDecorator } from './param-decorator.js';

/**
 * Describe un parámetro de entrada de un endpoint de NestJS.
 */
export interface ParamSpec {
  /** Nombre del parámetro tal como aparece en el método. */
  name: string;
  /** Tipo TypeScript declarado del parámetro. */
  type: string;
  /** Decorador de NestJS que origina el parámetro. */
  decorator: ParamDecorator;
  /** Indica si el parámetro está marcado como opcional. */
  isOptional: boolean;
}
