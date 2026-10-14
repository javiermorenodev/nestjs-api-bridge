import type { ControllerSpec, EndpointSpec, HttpMethod, ParamSpec } from '../models/index.js';
import { getTemplate } from './template.js';

const BODY_METHODS: ReadonlySet<HttpMethod> = new Set<HttpMethod>(['POST', 'PUT', 'PATCH']);

interface ParamView {
  name: string;
  type: string;
  optional: boolean;
}

interface QueryParamView extends ParamView {
  queryKey: string;
}

interface MethodView {
  name: string;
  methodName: string;
  returnType: string;
  url: string;
  params: ParamView[];
  queryParams: QueryParamView[];
  bodyArg?: string;
}

interface ServiceView {
  serviceName: string;
  basePath: string;
  hasHttpParams: boolean;
  methods: MethodView[];
}

function toServiceName(controllerName: string): string {
  const suffix = 'Controller';
  if (controllerName.endsWith(suffix)) {
    return `${controllerName.slice(0, -suffix.length)}Service`;
  }
  return `${controllerName}Service`;
}

function unwrapReturnType(returnType: string): string {
  const text = returnType.trim();
  if (text.length === 0) {
    return 'unknown';
  }
  const match = /^Promise\s*<([\s\S]+)>$/.exec(text);
  return match?.[1]?.trim() || text;
}

function buildUrl(endpoint: EndpointSpec, basePath: string): string {
  let remainder = endpoint.path;
  if (basePath.length > 0 && remainder.startsWith(basePath)) {
    remainder = remainder.slice(basePath.length);
  }
  if (remainder.length > 0 && !remainder.startsWith('/')) {
    remainder = `/${remainder}`;
  }

  const interpolated = remainder.replace(
    /:([A-Za-z0-9_]+)/g,
    (_match, name: string) => `\${${name}}`,
  );

  return '`${this.baseUrl}' + interpolated + '`';
}

function toParamView(param: ParamSpec): ParamView {
  return { name: param.name, type: param.type, optional: param.isOptional };
}

function toMethodView(endpoint: EndpointSpec, basePath: string): MethodView {
  const bodyParam = endpoint.params.find((param) => param.decorator === 'Body');
  const queryParams = endpoint.params
    .filter((param) => param.decorator === 'Query')
    .map<QueryParamView>((param) => ({
      name: param.name,
      type: param.type,
      optional: param.isOptional,
      queryKey: param.name,
    }));

  const bodyArg = bodyParam?.name ?? (BODY_METHODS.has(endpoint.httpMethod) ? 'null' : undefined);

  return {
    name: endpoint.name,
    methodName: endpoint.httpMethod.toLowerCase(),
    returnType: unwrapReturnType(endpoint.returnType),
    url: buildUrl(endpoint, basePath),
    params: endpoint.params.map(toParamView),
    queryParams,
    ...(bodyArg === undefined ? {} : { bodyArg }),
  };
}

/**
 * Genera un servicio Angular (`@Injectable`) a partir de la especificación de un controlador.
 *
 * @param controller Controlador NestJS previamente parseado.
 * @returns El código fuente TypeScript del servicio Angular.
 */
export function generateAngularService(controller: ControllerSpec): string {
  const methods = controller.endpoints.map((endpoint) =>
    toMethodView(endpoint, controller.basePath),
  );

  const view: ServiceView = {
    serviceName: toServiceName(controller.name),
    basePath: controller.basePath,
    hasHttpParams: methods.some((method) => method.queryParams.length > 0),
    methods,
  };

  return `${getTemplate('angular-service.hbs')(view).trimEnd()}\n`;
}
