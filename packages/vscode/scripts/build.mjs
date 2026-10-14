import { cpSync, mkdirSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');
const coreDir = resolve(packageDir, '..', 'core');
const outDir = resolve(packageDir, 'out');
const watch = process.argv.includes('--watch');

function copyTemplates() {
  const from = resolve(coreDir, 'src', 'generators', 'templates');
  const to = resolve(outDir, 'templates');
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

const options = {
  entryPoints: [resolve(packageDir, 'src/extension.ts')],
  outfile: resolve(outDir, 'extension.js'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  sourcemap: true,
  logLevel: 'info',
  external: ['vscode', ...builtinModules, ...builtinModules.map((name) => `node:${name}`)],
  alias: {
    '@nestjs-api-bridge/core': resolve(coreDir, 'src', 'index.ts'),
  },
  banner: {
    js: 'var __importMetaUrl = require("node:url").pathToFileURL(__filename).href;',
  },
  define: {
    'import.meta.url': '__importMetaUrl',
  },
};

copyTemplates();

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
  console.log('[nestjs-api-bridge] watching for changes...');
} else {
  await esbuild.build(options);
  console.log('[nestjs-api-bridge] built out/extension.js');
}
