import { join } from 'node:path';
import * as vscode from 'vscode';
import {
  extractDto,
  generateAngularModel,
  generateFetchService,
  generateReactHooks,
  generateVueComposable,
  toKebabCase,
} from '@nestjs-api-bridge/core';
import type { EndpointNode } from '../tree/EndpointNode.js';
import {
  collectDtoNames,
  getBaseUrl,
  getProjectPath,
  isEndpointNode,
  pickDestinationFolder,
  stripControllerSuffix,
  writeTextFile,
} from './util.js';

export type TsClientKind = 'react' | 'vue';

export function createTsClientCommand(kind: TsClientKind): (node?: EndpointNode) => Promise<void> {
  return async (node?: EndpointNode): Promise<void> => {
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
    const baseUrl = getBaseUrl().replace(/\/+$/, '');
    await writeTextFile(
      join(destination, serviceFileName),
      generateFetchService(controller, { baseUrl }),
    );
    generated.push(serviceFileName);

    const wrapperFileName = `use-${baseName}.ts`;
    const wrapper =
      kind === 'react' ? generateReactHooks(controller) : generateVueComposable(controller);
    await writeTextFile(join(destination, wrapperFileName), wrapper);
    generated.push(wrapperFileName);

    const projectPath = getProjectPath();
    for (const dtoName of collectDtoNames(controller)) {
      const dto = extractDto(projectPath, dtoName);
      if (!dto) {
        continue;
      }
      const modelFileName = `${toKebabCase(dto.name)}.model.ts`;
      await writeTextFile(join(destination, modelFileName), generateAngularModel(dto));
      generated.push(modelFileName);
    }

    const openLabel = `Abrir ${wrapperFileName}`;
    const action = await vscode.window.showInformationMessage(
      `Generados: ${generated.join(', ')}`,
      openLabel,
    );
    if (action === openLabel) {
      await vscode.window.showTextDocument(vscode.Uri.file(join(destination, wrapperFileName)));
    }
  };
}
