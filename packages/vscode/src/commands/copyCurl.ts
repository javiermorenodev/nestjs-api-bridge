import * as vscode from 'vscode';
import {
  extractDto,
  type DtoProperty,
  type DtoSpec,
  type EndpointSpec,
} from '@nestjs-api-bridge/core';
import type { EndpointNode } from '../tree/EndpointNode.js';
import { buildEndpointUrl, getBaseUrl, getProjectPath, isEndpointNode } from './util.js';

/** Copia al portapapeles un comando cURL equivalente al endpoint seleccionado. */
export async function copyCurl(node?: EndpointNode): Promise<void> {
  if (!isEndpointNode(node)) {
    void vscode.window.showWarningMessage('Selecciona un endpoint en el árbol.');
    return;
  }

  const url = buildEndpointUrl(node.endpoint.path, getBaseUrl());
  const curl = buildCurl(node.endpoint, url);
  await vscode.env.clipboard.writeText(curl);
  void vscode.window.showInformationMessage('Comando cURL copiado al portapapeles.');
}

function buildCurl(endpoint: EndpointSpec, url: string): string {
  const lines = [`curl -X ${endpoint.httpMethod} '${url}'`];
  const body = buildSampleBody(endpoint);

  if (body !== undefined) {
    lines.push("  -H 'Content-Type: application/json'");
    lines.push(`  -d '${body}'`);
  }

  return lines.join(' \\\n');
}

function buildSampleBody(endpoint: EndpointSpec): string | undefined {
  const bodyParam = endpoint.params.find((param) => param.decorator === 'Body');
  if (!bodyParam) {
    return undefined;
  }

  const dto = extractDto(getProjectPath(), bodyParam.type);
  return dto ? JSON.stringify(sampleFromDto(dto), null, 2) : '{}';
}

function sampleFromDto(dto: DtoSpec): Record<string, unknown> {
  return Object.fromEntries(
    dto.properties.map((property) => [property.name, sampleValue(property)]),
  );
}

function sampleValue(property: DtoProperty): unknown {
  if (property.type.endsWith('[]') || /^Array\s*</.test(property.type)) {
    return [];
  }

  switch (property.type) {
    case 'string':
      return 'string';
    case 'number':
      return 0;
    case 'boolean':
      return true;
    case 'Date':
      return new Date(0).toISOString();
    default:
      return {};
  }
}
