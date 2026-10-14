import type { EndpointSpec } from './endpoint-spec.js';

/**
 * Representa un controlador NestJS con sus endpoints.
 */
export interface ControllerSpec {
  /** Nombre de la clase del controlador. */
  name: string;
  /** Prefijo de ruta común a todos los endpoints. */
  basePath: string;
  /** Ruta del archivo que define el controlador. */
  filePath: string;
  /** Endpoints expuestos por el controlador. */
  endpoints: EndpointSpec[];
}
