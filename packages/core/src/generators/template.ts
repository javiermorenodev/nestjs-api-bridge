import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';

type CompiledTemplate = ReturnType<typeof Handlebars.compile>;

const cache = new Map<string, CompiledTemplate>();

/**
 * Compila (y cachea) una plantilla Handlebars ubicada en `generators/templates/`.
 *
 * @param name Nombre del archivo de plantilla, incluyendo la extensión `.hbs`.
 */
export function getTemplate(name: string): CompiledTemplate {
  const cached = cache.get(name);
  if (cached) {
    return cached;
  }

  const templatePath = fileURLToPath(new URL(`./templates/${name}`, import.meta.url));
  const compiled = Handlebars.compile(readFileSync(templatePath, 'utf8'), { noEscape: true });
  cache.set(name, compiled);
  return compiled;
}
