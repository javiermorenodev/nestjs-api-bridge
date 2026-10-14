import type { ControllerSpec, EndpointSpec, ParamSpec } from '../models/index.js';
import { buildFromJsonExpression, tsTypeToDart, unwrapPromise } from './dart-types.js';
import { getTemplate } from './template.js';

interface FlutterMethodView {
  name: string;
  dartReturnType: string;
  paramList: string;
  callExpression: string;
  needsRes: boolean;
  returnStatement: string;
}

interface FlutterApiView {
  className: string;
  methods: FlutterMethodView[];
}

function toApiName(controllerName: string): string {
  const suffix = 'Controller';
  const base = controllerName.endsWith(suffix)
    ? controllerName.slice(0, -suffix.length)
    : controllerName;
  return `${base}Api`;
}

function toDartPath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) => `$${name}`);
}

function buildParamList(params: ParamSpec[]): string {
  const required = params.filter((param) => !param.isOptional);
  const optional = params.filter((param) => param.isOptional);

  const parts = required.map((param) => `${tsTypeToDart(param.type, param.name)} ${param.name}`);
  if (optional.length > 0) {
    const named = optional
      .map((param) => `${tsTypeToDart(param.type, param.name)}? ${param.name}`)
      .join(', ');
    parts.push(`{${named}}`);
  }

  return parts.join(', ');
}

function buildQueryLiteral(params: ParamSpec[]): string {
  const entries = params.map((param) => `'${param.name}': ${param.name}`).join(', ');
  return `{${entries}}`;
}

function toMethodView(endpoint: EndpointSpec): FlutterMethodView {
  const dartReturnType = tsTypeToDart(unwrapPromise(endpoint.returnType));

  const bodyParam = endpoint.params.find((param) => param.decorator === 'Body');
  const queryParams = endpoint.params.filter((param) => param.decorator === 'Query');

  const url = `'${toDartPath(endpoint.path)}'`;
  const queryPart =
    queryParams.length > 0 ? `, queryParameters: ${buildQueryLiteral(queryParams)}` : '';
  const dataPart = bodyParam ? `, data: ${bodyParam.name}.toJson()` : '';
  const callExpression = `_dio.${endpoint.httpMethod.toLowerCase()}(${url}${queryPart}${dataPart})`;

  const needsRes = dartReturnType !== 'void';

  return {
    name: endpoint.name,
    dartReturnType,
    paramList: buildParamList(endpoint.params),
    callExpression,
    needsRes,
    returnStatement: needsRes
      ? `return ${buildFromJsonExpression(dartReturnType, 'res.data', false)};`
      : '',
  };
}

/**
 * Genera un cliente de API en Dart (usando Dio) a partir de la especificación de un controlador.
 *
 * @param controller Controlador NestJS previamente parseado.
 * @returns El código fuente Dart con la clase cliente.
 */
export function generateFlutterApi(controller: ControllerSpec): string {
  const view: FlutterApiView = {
    className: toApiName(controller.name),
    methods: controller.endpoints.map(toMethodView),
  };

  return `${getTemplate('flutter-api.hbs')(view).trimEnd()}\n`;
}
