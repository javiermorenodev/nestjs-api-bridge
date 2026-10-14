import { resolve } from 'node:path';
import { globSync } from 'glob';
import {
  Node,
  Project,
  type ClassDeclaration,
  type InterfaceDeclaration,
  type PropertyDeclaration,
  type PropertySignature,
  type SourceFile,
  type TypeAliasDeclaration,
} from 'ts-morph';
import type { DtoProperty, DtoSpec } from '../models/index.js';

const CLASS_VALIDATOR_PACKAGE = 'class-validator';

const KNOWN_VALIDATORS = new Set([
  'IsString',
  'IsNumber',
  'IsInt',
  'IsBoolean',
  'IsDate',
  'IsEmail',
  'IsEnum',
  'IsArray',
  'IsObject',
  'IsUUID',
  'IsUrl',
  'IsOptional',
  'IsNotEmpty',
  'IsDefined',
  'IsPositive',
  'IsNegative',
  'IsNumberString',
  'IsDateString',
  'ValidateNested',
  'Min',
  'Max',
  'MinLength',
  'MaxLength',
  'Length',
  'Matches',
  'ArrayMinSize',
  'ArrayMaxSize',
]);

function getValidatorNames(sourceFile: SourceFile): Set<string> {
  const names = new Set<string>();

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    if (importDeclaration.getModuleSpecifierValue() !== CLASS_VALIDATOR_PACKAGE) {
      continue;
    }
    for (const namedImport of importDeclaration.getNamedImports()) {
      names.add(namedImport.getAliasNode()?.getText() ?? namedImport.getName());
    }
  }

  return names;
}

function isValidator(name: string, validatorNames: Set<string>): boolean {
  return validatorNames.has(name) || KNOWN_VALIDATORS.has(name);
}

function getPropertyType(node: PropertyDeclaration | PropertySignature): string {
  return node.getTypeNode()?.getText() ?? 'unknown';
}

function extractValidators(
  node: PropertyDeclaration,
  validatorNames: Set<string>,
): string[] | undefined {
  const validators = node
    .getDecorators()
    .map((decorator) => decorator.getName())
    .filter((name) => isValidator(name, validatorNames));

  return validators.length > 0 ? validators : undefined;
}

function extractClassProperties(
  classDeclaration: ClassDeclaration,
  validatorNames: Set<string>,
): DtoProperty[] {
  return classDeclaration.getProperties().map((property) => {
    const validators = extractValidators(property, validatorNames);
    const isOptional =
      property.hasQuestionToken() ||
      property.getDecorators().some((decorator) => decorator.getName() === 'IsOptional');

    return {
      name: property.getName(),
      type: getPropertyType(property),
      isOptional,
      ...(validators === undefined ? {} : { validators }),
    };
  });
}

function extractSignatureProperties(properties: PropertySignature[]): DtoProperty[] {
  return properties.map((property) => ({
    name: property.getName(),
    type: getPropertyType(property),
    isOptional: property.hasQuestionToken(),
  }));
}

function extractTypeAliasProperties(typeAlias: TypeAliasDeclaration): DtoProperty[] {
  const typeNode = typeAlias.getTypeNode();
  if (!typeNode) {
    return [];
  }

  if (Node.isTypeLiteral(typeNode)) {
    return extractSignatureProperties(typeNode.getProperties());
  }

  if (Node.isIntersectionTypeNode(typeNode)) {
    return typeNode
      .getTypeNodes()
      .filter((member) => Node.isTypeLiteral(member))
      .flatMap((member) => extractSignatureProperties(member.getProperties()));
  }

  return [];
}

function extractFromSourceFile(sourceFile: SourceFile, dtoName: string): DtoSpec | undefined {
  const classDeclaration = sourceFile.getClass(dtoName);
  if (classDeclaration?.isExported()) {
    return {
      name: dtoName,
      filePath: sourceFile.getFilePath(),
      properties: extractClassProperties(classDeclaration, getValidatorNames(sourceFile)),
    };
  }

  const interfaceDeclaration: InterfaceDeclaration | undefined = sourceFile.getInterface(dtoName);
  if (interfaceDeclaration?.isExported()) {
    return {
      name: dtoName,
      filePath: sourceFile.getFilePath(),
      properties: extractSignatureProperties(interfaceDeclaration.getProperties()),
    };
  }

  const typeAlias = sourceFile.getTypeAlias(dtoName);
  if (typeAlias?.isExported()) {
    return {
      name: dtoName,
      filePath: sourceFile.getFilePath(),
      properties: extractTypeAliasProperties(typeAlias),
    };
  }

  return undefined;
}

/**
 * Busca y extrae la definición de un DTO a partir de su nombre.
 *
 * @param projectPath Directorio raíz donde buscar los archivos `*.dto.ts`.
 * @param dtoName Nombre de la clase, interfaz o type alias exportado.
 * @returns El `DtoSpec` encontrado o `undefined` si no existe.
 */
export function extractDto(projectPath: string, dtoName: string): DtoSpec | undefined {
  const root = resolve(projectPath).replace(/\\/g, '/');
  const files = globSync(`${root}/**/*.dto.ts`, {
    ignore: ['**/node_modules/**', '**/dist/**'],
  });

  if (files.length === 0) {
    return undefined;
  }

  const project = new Project({ skipFileDependencyResolution: true });

  for (const filePath of files) {
    const sourceFile = project.addSourceFileAtPath(filePath);
    const dto = extractFromSourceFile(sourceFile, dtoName);
    if (dto) {
      return dto;
    }
  }

  return undefined;
}
