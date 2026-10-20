import type { ControllerSpec, EndpointSpec, ParamSpec } from '../models/index.js';
import { toKebabCase } from '../utils/case.js';

const PROMISE_PATTERN = /^Promise\s*<([\s\S]+)>$/;

const NON_MODEL_TYPES: ReadonlySet<string> = new Set([
  'Promise',
  'Array',
  'Observable',
  'List',
  'Map',
  'Set',
  'Date',
]);

export interface ModelImportView {
  name: string;
  fileName: string;
}

export function unwrapPromiseType(type: string): string {
  const text = type.trim();
  if (text.length === 0) {
    return 'void';
  }
  return PROMISE_PATTERN.exec(text)?.[1]?.trim() || text;
}

export function buildParamList(params: ParamSpec[]): string {
  return params
    .map((param) => `${param.name}${param.isOptional ? '?' : ''}: ${param.type}`)
    .join(', ');
}

export function controllerBaseName(controllerName: string): string {
  const suffix = 'Controller';
  return controllerName.endsWith(suffix) ? controllerName.slice(0, -suffix.length) : controllerName;
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function collectModelImports(controller: ControllerSpec): ModelImportView[] {
  const names = new Set<string>();

  const collectFromType = (typeText: string): void => {
    const matches = typeText.match(/[A-Z][A-Za-z0-9_]*/g) ?? [];
    for (const match of matches) {
      if (!NON_MODEL_TYPES.has(match)) {
        names.add(match);
      }
    }
  };

  for (const endpoint of controller.endpoints) {
    if (endpoint.bodyType) {
      collectFromType(endpoint.bodyType);
    }
    collectFromType(endpoint.returnType);
    for (const param of endpoint.params) {
      collectFromType(param.type);
    }
  }

  return [...names].map((name) => ({
    name,
    fileName: `${toKebabCase(name)}.model`,
  }));
}

export function pathExpression(endpoint: EndpointSpec, withQuery: boolean): string {
  const interpolated = endpoint.path.replace(
    /:([A-Za-z0-9_]+)/g,
    (_match, name: string) => '${' + name + '}',
  );

  if (!withQuery) {
    return '`' + interpolated + '`';
  }

  const querySuffix = "${queryString ? `?${queryString}` : ''}";
  return '`' + interpolated + querySuffix + '`';
}
