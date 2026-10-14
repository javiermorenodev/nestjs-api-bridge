import type { DtoProperty } from './dto-property.js';

/**
 * Representa un DTO extraído del código fuente de NestJS.
 */
export interface DtoSpec {
  /** Nombre de la clase DTO. */
  name: string;
  /** Ruta absoluta o relativa del archivo que define el DTO. */
  filePath: string;
  /** Propiedades declaradas en el DTO. */
  properties: DtoProperty[];
}
