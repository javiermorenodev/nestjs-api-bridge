import * as vscode from 'vscode';
import { EndpointTreeProvider } from './tree/EndpointTreeProvider.js';

const ENDPOINTS_VIEW_ID = 'nestjsApiBridge.endpoints';
const CONTROLLER_GLOB = '**/*.controller.ts';

export function activate(context: vscode.ExtensionContext): void {
  const projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
  const provider = new EndpointTreeProvider(projectPath);

  context.subscriptions.push(
    vscode.window.createTreeView(ENDPOINTS_VIEW_ID, { treeDataProvider: provider }),
    provider,
  );

  const watcher = vscode.workspace.createFileSystemWatcher(CONTROLLER_GLOB);
  watcher.onDidCreate(() => provider.refresh());
  watcher.onDidChange(() => provider.refresh());
  watcher.onDidDelete(() => provider.refresh());
  context.subscriptions.push(watcher);
}

export function deactivate(): void {}
