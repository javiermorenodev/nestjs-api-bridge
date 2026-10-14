import * as vscode from 'vscode';
import type { EndpointLeafNode } from '../tree/EndpointNode.js';

export const DEFAULT_BASE_URL = 'http://localhost:3000';

const PATH_PARAM_PATTERN = /:([A-Za-z0-9_]+)/g;

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

/** Convierte `UserProfile` a `user-profile`. */
export function toKebabCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** Quita el sufijo `Controller` del nombre de una clase. */
export function stripControllerSuffix(controllerName: string): string {
  return controllerName.replace(/Controller$/, '');
}

function sampleParamValue(name: string): string {
  return name.toLowerCase() === 'id' || name.toLowerCase().endsWith('id') ? '1' : 'value';
}
