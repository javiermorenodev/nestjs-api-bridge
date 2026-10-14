const PROMISE_PATTERN = /^Promise\s*<([\s\S]+)>$/;
const LIST_PATTERN = /^List<([\s\S]+)>$/;

const INT_WORDS = new Set([
  'id',
  'ids',
  'count',
  'quantity',
  'qty',
  'age',
  'index',
  'size',
  'length',
  'total',
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'page',
  'offset',
  'limit',
]);

const DOUBLE_WORDS = new Set([
  'price',
  'amount',
  'rate',
  'ratio',
  'score',
  'weight',
  'height',
  'latitude',
  'longitude',
  'lat',
  'lng',
  'temperature',
  'percentage',
  'discount',
  'decimal',
  'average',
  'avg',
  'balance',
]);

const PRIMITIVE_DART_TYPES = new Set(['String', 'num', 'int', 'double', 'bool', 'dynamic', 'void']);

function words(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.toLowerCase());
}

function numberType(name: string | undefined): string {
  if (name) {
    const last = words(name).at(-1);
    if (last && DOUBLE_WORDS.has(last)) {
      return 'double';
    }
    if (last && INT_WORDS.has(last)) {
      return 'int';
    }
  }
  return 'num';
}

/** Quita el envoltorio `Promise<T>` de un tipo de retorno TypeScript. */
export function unwrapPromise(type: string): string {
  const text = type.trim();
  if (text.length === 0) {
    return 'void';
  }
  const match = PROMISE_PATTERN.exec(text);
  return match?.[1]?.trim() || text;
}

/** Convierte un tipo TypeScript a su equivalente en Dart. */
export function tsTypeToDart(type: string, name?: string): string {
  const text = type.trim();

  const arrayMatch = /^([\s\S]+)\[\]$/.exec(text);
  if (arrayMatch?.[1]) {
    return `List<${tsTypeToDart(arrayMatch[1], name)}>`;
  }

  const genericArray = /^Array\s*<([\s\S]+)>$/.exec(text);
  if (genericArray?.[1]) {
    return `List<${tsTypeToDart(genericArray[1], name)}>`;
  }

  switch (text) {
    case 'string':
      return 'String';
    case 'number':
      return numberType(name);
    case 'boolean':
      return 'bool';
    case 'Date':
      return 'DateTime';
    case 'void':
      return 'void';
    case 'any':
    case 'unknown':
      return 'dynamic';
    default:
      return text;
  }
}

/** Indica si un tipo Dart es primitivo (sin `fromJson`/`toJson`). */
export function isPrimitiveDartType(type: string): boolean {
  return PRIMITIVE_DART_TYPES.has(type);
}

function listInner(type: string): string | undefined {
  return LIST_PATTERN.exec(type)?.[1];
}

/** Construye la expresión Dart que deserializa `source` al tipo indicado. */
export function buildFromJson(dartType: string, source: string): string {
  const inner = listInner(dartType);
  if (inner) {
    if (isPrimitiveDartType(inner)) {
      return `List<${inner}>.from(${source} as List)`;
    }
    return `(${source} as List).map((e) => ${buildFromJson(inner, 'e')}).toList()`;
  }

  switch (dartType) {
    case 'String':
      return `${source} as String`;
    case 'num':
      return `${source} as num`;
    case 'int':
      return `${source} as int`;
    case 'double':
      return `${source} as double`;
    case 'bool':
      return `${source} as bool`;
    case 'dynamic':
    case 'void':
      return source;
    case 'DateTime':
      return `DateTime.parse(${source} as String)`;
    default:
      return `${dartType}.fromJson(${source} as Map<String, dynamic>)`;
  }
}

/** Igual que {@link buildFromJson} pero contemplando propiedades opcionales. */
export function buildFromJsonExpression(
  dartType: string,
  source: string,
  optional: boolean,
): string {
  const expression = buildFromJson(dartType, source);
  return optional ? `${source} == null ? null : ${expression}` : expression;
}

/** Construye la expresión Dart que serializa una propiedad a JSON. */
export function buildToJson(dartType: string, name: string): string {
  const inner = listInner(dartType);
  if (inner) {
    if (isPrimitiveDartType(inner)) {
      return name;
    }
    return `${name}.map((e) => ${buildToJson(inner, 'e')}).toList()`;
  }

  switch (dartType) {
    case 'String':
    case 'num':
    case 'int':
    case 'double':
    case 'bool':
    case 'dynamic':
      return name;
    case 'DateTime':
      return `${name}.toIso8601String()`;
    default:
      return `${name}.toJson()`;
  }
}
