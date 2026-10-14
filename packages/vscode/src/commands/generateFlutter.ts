import { join } from 'node:path';
import * as vscode from 'vscode';
import {
  extractDto,
  generateFlutterApi,
  generateFlutterModel,
  type ControllerSpec,
} from '@nestjs-api-bridge/core';
import type { EndpointNode } from '../tree/EndpointNode.js';
import {
  getProjectPath,
  isEndpointNode,
  pickDestinationFolder,
  stripControllerSuffix,
  toKebabCase,
  writeTextFile,
} from './util.js';

const GENERIC_TYPE_WORDS = new Set(['Promise', 'Array', 'List']);

/** Genera el cliente de API Flutter y sus modelos para el endpoint seleccionado. */
export async function generateFlutter(node?: EndpointNode): Promise<void> {
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

  const apiFileName = `${baseName}_api.dart`;
  await writeTextFile(join(destination, apiFileName), generateFlutterApi(controller));
  generated.push(apiFileName);

  const projectPath = getProjectPath();
  for (const dtoName of collectDtoNames(controller)) {
    const dto = extractDto(projectPath, dtoName);
    if (!dto) {
      continue;
    }
    const modelFileName = `${toKebabCase(dto.name)}.dart`;
    await writeTextFile(join(destination, modelFileName), generateFlutterModel(dto));
    generated.push(modelFileName);
  }

  void vscode.window.showInformationMessage(`Generados: ${generated.join(', ')}`);
}

function collectDtoNames(controller: ControllerSpec): string[] {
  const names = new Set<string>();

  for (const endpoint of controller.endpoints) {
    if (endpoint.bodyType) {
      names.add(endpoint.bodyType);
    }
    for (const name of extractReferencedTypes(endpoint.returnType)) {
      names.add(name);
    }
  }

  return [...names];
}

function extractReferencedTypes(typeText: string): string[] {
  const matches = typeText.match(/[A-Z][A-Za-z0-9_]*/g) ?? [];
  return matches.filter((name) => !GENERIC_TYPE_WORDS.has(name));
}
