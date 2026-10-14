import * as vscode from 'vscode';
import { parseNestProject, type ControllerSpec, type HttpMethod } from '@nestjs-api-bridge/core';
import type { ControllerNode, EndpointLeafNode, EndpointNode } from './EndpointNode.js';

/**
 * Provee el árbol de endpoints NestJS a la vista lateral de VS Code.
 */
export class EndpointTreeProvider
  implements vscode.TreeDataProvider<EndpointNode>, vscode.Disposable
{
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    EndpointNode | undefined | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  private controllers: ControllerSpec[] = [];

  constructor(private readonly projectPath: string) {
    this.reload();
  }

  /** Vuelve a analizar el proyecto y notifica a la vista para que se repinte. */
  refresh(): void {
    this.reload();
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: EndpointNode): vscode.TreeItem {
    return element.kind === 'controller'
      ? this.createControllerItem(element)
      : this.createEndpointItem(element);
  }

  getChildren(element?: EndpointNode): EndpointNode[] {
    if (!element) {
      return this.controllers.map<ControllerNode>((controller) => ({
        kind: 'controller',
        controller,
      }));
    }

    if (element.kind === 'controller') {
      return element.controller.endpoints.map<EndpointLeafNode>((endpoint) => ({
        kind: 'endpoint',
        controller: element.controller,
        endpoint,
      }));
    }

    return [];
  }

  dispose(): void {
    this.onDidChangeTreeDataEmitter.dispose();
  }

  private reload(): void {
    try {
      this.controllers = parseNestProject(this.projectPath).controllers;
    } catch {
      this.controllers = [];
    }
  }

  private createControllerItem(node: ControllerNode): vscode.TreeItem {
    const item = new vscode.TreeItem(
      node.controller.name,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    item.description = node.controller.basePath;
    item.contextValue = 'nestjsController';
    item.iconPath = new vscode.ThemeIcon('symbol-class');
    return item;
  }

  private createEndpointItem(node: EndpointLeafNode): vscode.TreeItem {
    const { endpoint } = node;
    const item = new vscode.TreeItem(
      `${endpoint.httpMethod} ${endpoint.path}`,
      vscode.TreeItemCollapsibleState.None,
    );
    item.contextValue = 'nestjsEndpoint';
    item.iconPath = endpointIcon(endpoint.httpMethod);
    item.tooltip = new vscode.MarkdownString(
      `**${node.controller.name}.${endpoint.name}**\n\n` +
        `- Método: \`${endpoint.httpMethod}\`\n` +
        `- Ruta: \`${endpoint.path}\`\n` +
        `- Retorna: \`${endpoint.returnType}\`\n` +
        `- Línea: ${endpoint.line}`,
    );
    return item;
  }
}

function endpointIcon(httpMethod: HttpMethod): vscode.ThemeIcon {
  switch (httpMethod) {
    case 'GET':
      return new vscode.ThemeIcon('symbol-method', new vscode.ThemeColor('charts.green'));
    case 'POST':
      return new vscode.ThemeIcon('add', new vscode.ThemeColor('charts.blue'));
    case 'DELETE':
      return new vscode.ThemeIcon('trash', new vscode.ThemeColor('charts.red'));
    case 'PUT':
    case 'PATCH':
      return new vscode.ThemeIcon('edit', new vscode.ThemeColor('charts.orange'));
  }
}
