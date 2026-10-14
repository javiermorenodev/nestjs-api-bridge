import { join } from 'node:path';
import * as vscode from 'vscode';
import { generateAngularService } from '@nestjs-api-bridge/core';
import type { EndpointNode } from '../tree/EndpointNode.js';
import {
  isEndpointNode,
  pickDestinationFolder,
  stripControllerSuffix,
  toKebabCase,
  writeTextFile,
} from './util.js';

/** Genera un servicio Angular para el controlador del endpoint seleccionado. */
export async function generateAngular(node?: EndpointNode): Promise<void> {
  if (!isEndpointNode(node)) {
    void vscode.window.showWarningMessage('Selecciona un endpoint en el árbol.');
    return;
  }

  const destination = await pickDestinationFolder();
  if (!destination) {
    return;
  }

  const { controller } = node;
  const code = generateAngularService(controller);
  const fileName = `${toKebabCase(stripControllerSuffix(controller.name))}.service.ts`;
  const filePath = join(destination, fileName);

  await writeTextFile(filePath, code);

  const action = await vscode.window.showInformationMessage(`Generado ${fileName}`, 'Abrir');
  if (action === 'Abrir') {
    await vscode.window.showTextDocument(vscode.Uri.file(filePath));
  }
}
