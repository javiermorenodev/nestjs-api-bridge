import * as vscode from 'vscode';
import type { EndpointNode } from '../tree/EndpointNode.js';
import { buildEndpointUrl, getBaseUrl, isEndpointNode } from './util.js';

/** Copia al portapapeles la URL completa del endpoint seleccionado. */
export async function copyUrl(node?: EndpointNode): Promise<void> {
  if (!isEndpointNode(node)) {
    void vscode.window.showWarningMessage('Selecciona un endpoint en el árbol.');
    return;
  }

  const url = buildEndpointUrl(node.endpoint.path, getBaseUrl());
  await vscode.env.clipboard.writeText(url);
  void vscode.window.showInformationMessage(`URL copiada: ${url}`);
}
