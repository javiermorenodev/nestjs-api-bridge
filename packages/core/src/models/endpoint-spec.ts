import type { HttpMethod } from './http-method.js';
import type { ParamSpec } from './param-spec.js';

/**
 * Describe un endpoint de un controlador NestJS.
 */
export interface EndpointSpec {
  /** Nombre del método del controlador. */
  name: string;
  /** Método HTTP asociado al endpoint. */
  httpMethod: HttpMethod;
  /** Ruta del endpoint, relativa al `basePath` del controlador. */
  path: string;
  /** Parámetros de entrada del endpoint. */
  params: ParamSpec[];
  /** Tipo del cuerpo de la petición, si aplica. */
  bodyType?: string;
  /** Tipo TypeScript del valor de retorno. */
  returnType: string;
  /** Número de línea donde se declara el método. */
  line: number;
  /** Indica si el método está declarado como `async`. */
  isAsync: boolean;
}
