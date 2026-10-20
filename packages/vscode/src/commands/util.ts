import * as vscode from 'vscode';
import type { EndpointLeafNode } from '../tree/EndpointNode.js';

import type { ControllerSpec } from '@nestjs-api-bridge/core';

export const DEFAULT_BASE_URL = 'http://localhost:3000';

export { toKebabCase } from '@nestjs-api-bridge/core';

const PATH_PARAM_PATTERN = /:([A-Za-z0-9_]+)/g;

const GENERIC_TYPE_WORDS = new Set(['Promise', 'Array', 'List', 'Observable', 'Map', 'Set']);

/** Determina si el valor recibido por un comando es un nodo de endpoint. */
export function isEndpointNode(node: unknown): node is EndpointLeafNode {
  return (
    typeof node === 'object' && node !== null && (node as { kind?: unknown }).kind === 'endpoint'
  );
}

/** Ruta de la carpeta raíz del workspace (o el cwd como último recurso). */
export function getProjectPath(): string {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
}

/** URL base configurable mediante `nestjsApiBridge.baseUrl`. */
export function getBaseUrl(): string {
  const configured = vscode.workspace.getConfiguration('nestjsApiBridge').get<string>('baseUrl');
  return configured && configured.length > 0 ? configured : DEFAULT_BASE_URL;
}

/** Construye una URL concreta sustituyendo los `:param` por valores de ejemplo. */
export function buildEndpointUrl(endpointPath: string, baseUrl: string): string {
  const path = endpointPath.replace(PATH_PARAM_PATTERN, (_match, name: string) =>
    sampleParamValue(name),
  );
  const base = baseUrl.replace(/\/+$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Pide al usuario una carpeta destino mediante `showOpenDialog`. */
export async function pickDestinationFolder(): Promise<string | undefined> {
  const selection = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Seleccionar carpeta destino',
  });
  return selection?.[0]?.fsPath;
}

/** Escribe texto UTF-8 en disco usando la API de workspace (soporta remoto). */
export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await vscode.workspace.fs.writeFile(vscode.Uri.file(filePath), Buffer.from(content, 'utf8'));
}

/** Quita el sufijo `Controller` del nombre de una clase. */
export function stripControllerSuffix(controllerName: string): string {
  return controllerName.replace(/Controller$/, '');
}

function sampleParamValue(name: string): string {
  return name.toLowerCase() === 'id' || name.toLowerCase().endsWith('id') ? '1' : 'value';
}

export function collectDtoNames(controller: ControllerSpec): string[] {
  const names = new Set<string>();

  const collectFromType = (typeText: string): void => {
    const matches = typeText.match(/[A-Z][A-Za-z0-9_]*/g) ?? [];
    for (const match of matches) {
      if (!GENERIC_TYPE_WORDS.has(match)) {
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

  return [...names];
}
