import type { ControllerSpec } from './controller-spec.js';

/**
 * Especificación completa de una API extraída de NestJS.
 */
export interface ApiSpec {
  /** Controladores detectados en la API. */
  controllers: ControllerSpec[];
}
