import { resolve } from 'node:path';
import { globSync } from 'glob';
import {
  Node,
  Project,
  type ClassDeclaration,
  type Decorator,
  type MethodDeclaration,
  type ParameterDeclaration,
  type SourceFile,
} from 'ts-morph';
import type {
  ApiSpec,
  ControllerSpec,
  EndpointSpec,
  HttpMethod,
  ParamDecorator,
  ParamSpec,
} from '../models/index.js';

const HTTP_DECORATORS: Readonly<Record<string, HttpMethod>> = {
  Get: 'GET',
  Post: 'POST',
  Put: 'PUT',
  Patch: 'PATCH',
  Delete: 'DELETE',
};

const HTTP_DECORATOR_NAMES = Object.keys(HTTP_DECORATORS);

const PARAM_DECORATORS: readonly ParamDecorator[] = ['Param', 'Query', 'Body', 'Headers'];

interface DecoratedNode {
  getDecorators(): Decorator[];
}

function findDecorator(node: DecoratedNode, names: readonly string[]): Decorator | undefined {
  return node.getDecorators().find((decorator) => names.includes(decorator.getName()));
}

function getFirstStringArgument(decorator: Decorator): string | undefined {
  const [argument] = decorator.getArguments();
  if (
    argument &&
    (Node.isStringLiteral(argument) || Node.isNoSubstitutionTemplateLiteral(argument))
  ) {
    return argument.getLiteralValue();
  }
  return undefined;
}

function normalizeBasePath(path: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  return trimmed.length > 0 ? `/${trimmed}` : '';
}

function joinPaths(...segments: string[]): string {
  const parts = segments
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter((segment) => segment.length > 0);
  return `/${parts.join('/')}`;
}

function getTypeText(parameter: ParameterDeclaration): string {
  return parameter.getTypeNode()?.getText() ?? 'unknown';
}

function extractParams(method: MethodDeclaration): { params: ParamSpec[]; bodyType?: string } {
  const params: ParamSpec[] = [];
  let bodyType: string | undefined;

  for (const parameter of method.getParameters()) {
    const decorator = findDecorator(parameter, PARAM_DECORATORS);
    if (!decorator) {
      continue;
    }

    const decoratorName = decorator.getName() as ParamDecorator;
    const type = getTypeText(parameter);
    const name = getFirstStringArgument(decorator) ?? parameter.getName();
    const isOptional = parameter.isOptional() || parameter.hasInitializer();

    params.push({ name, type, decorator: decoratorName, isOptional });

    if (decoratorName === 'Body' && bodyType === undefined) {
      bodyType = type;
    }
  }

  return bodyType === undefined ? { params } : { params, bodyType };
}

function extractEndpoint(method: MethodDeclaration, basePath: string): EndpointSpec | undefined {
  const decorator = findDecorator(method, HTTP_DECORATOR_NAMES);
  if (!decorator) {
    return undefined;
  }

  const httpMethod = HTTP_DECORATORS[decorator.getName()];
  if (!httpMethod) {
    return undefined;
  }

  const methodPath = getFirstStringArgument(decorator) ?? '';
  const { params, bodyType } = extractParams(method);

  return {
    name: method.getName(),
    httpMethod,
    path: joinPaths(basePath, methodPath),
    params,
    ...(bodyType === undefined ? {} : { bodyType }),
    returnType: method.getReturnTypeNode()?.getText() ?? 'unknown',
    line: method.getStartLineNumber(),
    isAsync: method.isAsync(),
  };
}

function extractController(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  decorator: Decorator,
): ControllerSpec {
  const basePath = getFirstStringArgument(decorator) ?? '';
  const endpoints = classDeclaration
    .getMethods()
    .map((method) => extractEndpoint(method, basePath))
    .filter((endpoint): endpoint is EndpointSpec => endpoint !== undefined);

  return {
    name: classDeclaration.getName() ?? 'AnonymousController',
    basePath: normalizeBasePath(basePath),
    filePath: sourceFile.getFilePath(),
    endpoints,
  };
}

function extractControllers(sourceFile: SourceFile): ControllerSpec[] {
  const controllers: ControllerSpec[] = [];

  for (const classDeclaration of sourceFile.getClasses()) {
    const decorator = findDecorator(classDeclaration, ['Controller']);
    if (decorator) {
      controllers.push(extractController(sourceFile, classDeclaration, decorator));
    }
  }

  return controllers;
}

/**
 * Analiza estáticamente un proyecto NestJS y extrae la especificación de su API.
 *
 * @param projectPath Ruta del directorio raíz que contiene los `*.controller.ts`.
 * @returns La `ApiSpec` con todos los controladores y endpoints detectados.
 */
export function parseNestProject(projectPath: string): ApiSpec {
  const root = resolve(projectPath).replace(/\\/g, '/');
  const files = globSync(`${root}/**/*.controller.ts`, {
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  if (files.length === 0) {
    return { controllers: [] };
  }

  const project = new Project({ skipFileDependencyResolution: true });
  project.addSourceFilesAtPaths(files);

  const controllers = project
    .getSourceFiles()
    .flatMap((sourceFile) => extractControllers(sourceFile));

  return { controllers };
}
