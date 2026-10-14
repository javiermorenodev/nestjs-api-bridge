import type { DtoProperty, DtoSpec } from '../models/index.js';
import { buildFromJsonExpression, buildToJson, tsTypeToDart } from './dart-types.js';
import { getTemplate } from './template.js';

interface DartPropertyView {
  name: string;
  dartType: string;
  fromJson: string;
  toJsonValue: string;
  optional: boolean;
}

interface FlutterModelView {
  className: string;
  properties: DartPropertyView[];
}

function toPropertyView(property: DtoProperty): DartPropertyView {
  const base = tsTypeToDart(property.type, property.name);
  const source = `json['${property.name}']`;

  return {
    name: property.name,
    dartType: property.isOptional ? `${base}?` : base,
    fromJson: buildFromJsonExpression(base, source, property.isOptional),
    toJsonValue: buildToJson(base, property.name),
    optional: property.isOptional,
  };
}

/**
 * Genera una clase de modelo en Dart a partir de la especificación de un DTO.
 *
 * @param dto DTO previamente extraído del proyecto NestJS.
 * @returns El código fuente Dart con la clase modelo, `fromJson` y `toJson`.
 */
export function generateFlutterModel(dto: DtoSpec): string {
  const view: FlutterModelView = {
    className: dto.name,
    properties: dto.properties.map(toPropertyView),
  };

  return `${getTemplate('flutter-model.hbs')(view).trimEnd()}\n`;
}
