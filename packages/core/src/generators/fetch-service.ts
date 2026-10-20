import type { ControllerSpec, EndpointSpec } from '../models/index.js';
import { getTemplate } from './template.js';
import {
  buildParamList,
  collectModelImports,
  pathExpression,
  unwrapPromiseType,
  type ModelImportView,
} from './ts-utils.js';

export interface FetchServiceOptions {
  baseUrl?: string;
}

interface MethodView {
  name: string;
  signature: string;
  body: string;
}

interface ServiceView {
  baseUrl: string;
  importBlock: string;
  methods: MethodView[];
}

function buildParamInitializer(endpoint: EndpointSpec): string[] {
  const initParts = [`method: '${endpoint.httpMethod}'`];

  const bodyParam = endpoint.params.find((param) => param.decorator === 'Body');
  if (bodyParam) {
    initParts.push(`body: JSON.stringify(${bodyParam.name})`);
  }

  const headersParam = endpoint.params.find((param) => param.decorator === 'Headers');
  if (headersParam) {
    initParts.push(`headers: ${headersParam.name}`);
  }

  return initParts;
}

function buildMethodBody(endpoint: EndpointSpec): string {
  const lines: string[] = [];
  const queryParams = endpoint.params.filter((param) => param.decorator === 'Query');

  if (queryParams.length > 0) {
    lines.push('  const query = new URLSearchParams();');
    for (const param of queryParams) {
      lines.push(`  if (${param.name} !== undefined && ${param.name} !== null) {`);
      lines.push(`    query.set('${param.name}', String(${param.name}));`);
      lines.push('  }');
    }
    lines.push('  const queryString = query.toString();');
    lines.push('');
  }

  const init = buildParamInitializer(endpoint).join(', ');
  const path = pathExpression(endpoint, queryParams.length > 0);
  lines.push(`  return request<${unwrapPromiseType(endpoint.returnType)}>(${path}, { ${init} });`);

  return lines.join('\n');
}

function toMethodView(endpoint: EndpointSpec): MethodView {
  return {
    name: endpoint.name,
    signature: `(${buildParamList(endpoint.params)}): Promise<${unwrapPromiseType(endpoint.returnType)}>`,
    body: buildMethodBody(endpoint),
  };
}

function buildImportBlock(imports: ModelImportView[]): string {
  if (imports.length === 0) {
    return '';
  }
  const lines = imports.map((item) => `import type { ${item.name} } from './${item.fileName}';`);
  return `${lines.join('\n')}\n\n`;
}

/**
 * Genera un servicio TypeScript basado en `fetch` a partir de la especificación de un controlador.
 *
 * @param controller Controlador NestJS previamente parseado.
 * @param options Opciones de generación, como la URL base del API.
 * @returns El código fuente TypeScript del servicio.
 */
export function generateFetchService(
  controller: ControllerSpec,
  options: FetchServiceOptions = {},
): string {
  const view: ServiceView = {
    baseUrl: options.baseUrl ?? '',
    importBlock: buildImportBlock(collectModelImports(controller)),
    methods: controller.endpoints.map(toMethodView),
  };

  return `${getTemplate('fetch-service.hbs')(view).trimEnd()}\n`;
}
