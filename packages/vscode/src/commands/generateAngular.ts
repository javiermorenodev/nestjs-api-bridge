import { join } from 'node:path';
import * as vscode from 'vscode';
import {
  extractDto,
  generateAngularModel,
  generateAngularService,
  toKebabCase,
} from '@nestjs-api-bridge/core';
import type { EndpointNode } from '../tree/EndpointNode.js';
import {
  collectDtoNames,
  getProjectPath,
  isEndpointNode,
  pickDestinationFolder,
  stripControllerSuffix,
  writeTextFile,
} from './util.js';

/** Genera un servicio Angular y sus DTOs para el controlador seleccionado. */
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
  const baseName = toKebabCase(stripControllerSuffix(controller.name));
  const generated: string[] = [];

  const serviceFileName = `${baseName}.service.ts`;
  await writeTextFile(join(destination, serviceFileName), generateAngularService(controller));
  generated.push(serviceFileName);

  const projectPath = getProjectPath();
  for (const dtoName of collectDtoNames(controller)) {
    const dto = extractDto(projectPath, dtoName);
    if (!dto) {
      continue;
    }
    const modelFileName = `${toKebabCase(dto.name)}.ts`;
    await writeTextFile(join(destination, modelFileName), generateAngularModel(dto));
    generated.push(modelFileName);
  }

  const action = await vscode.window.showInformationMessage(
    `Generados: ${generated.join(', ')}`,
    'Abrir servicio',
  );
  if (action === 'Abrir servicio') {
    await vscode.window.showTextDocument(vscode.Uri.file(join(destination, serviceFileName)));
  }
}
