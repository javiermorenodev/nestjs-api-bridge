/**
 * Propiedad de un DTO detectada mediante análisis estático.
 */
export interface DtoProperty {
  /** Nombre de la propiedad. */
  name: string;
  /** Tipo TypeScript declarado de la propiedad. */
  type: string;
  /** Indica si la propiedad está marcada como opcional. */
  isOptional: boolean;
  /** Validadores de class-validator aplicados a la propiedad. */
  validators?: string[];
}
