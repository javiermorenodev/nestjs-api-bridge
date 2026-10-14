import * as vscode from 'vscode';
import type { EndpointNode } from '../tree/EndpointNode.js';
import { isEndpointNode } from './util.js';

/** Abre el archivo del controlador en la línea donde se declara el endpoint. */
export async function openHandler(node?: EndpointNode): Promise<void> {
  if (!isEndpointNode(node)) {
    void vscode.window.showWarningMessage('Selecciona un endpoint en el árbol.');
    return;
  }

  const document = await vscode.workspace.openTextDocument(node.controller.filePath);
  const position = new vscode.Position(Math.max(node.endpoint.line - 1, 0), 0);
  const selection = new vscode.Selection(position, position);

  await vscode.window.showTextDocument(document, { selection, preview: false });
}
