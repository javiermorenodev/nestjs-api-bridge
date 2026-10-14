import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ControllerSpec, EndpointSpec, ParamSpec } from '../models/index.js';
import { parseNestProject } from './controllers.js';

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), '__fixtures__');

function findController(controllers: ControllerSpec[], name: string): ControllerSpec {
  const controller = controllers.find((candidate) => candidate.name === name);
  if (!controller) {
    throw new Error(`Controller ${name} not found`);
  }
  return controller;
}

function findEndpoint(controller: ControllerSpec, name: string): EndpointSpec {
  const endpoint = controller.endpoints.find((candidate) => candidate.name === name);
  if (!endpoint) {
    throw new Error(`Endpoint ${name} not found`);
  }
  return endpoint;
}

function findParam(params: ParamSpec[], name: string): ParamSpec {
  const param = params.find((candidate) => candidate.name === name);
  if (!param) {
    throw new Error(`Param ${name} not found`);
  }
  return param;
}

describe('parseNestProject', () => {
  const spec = parseNestProject(fixturesDir);
  const users = findController(spec.controllers, 'UsersController');

  it('extracts controllers with their base path and source file', () => {
    expect(spec.controllers).toHaveLength(2);
    expect(users.basePath).toBe('/users');
    expect(users.filePath.endsWith(join('__fixtures__', 'sample.controller.ts'))).toBe(true);

    const health = findController(spec.controllers, 'HealthController');
    expect(health.basePath).toBe('');
    expect(findEndpoint(health, 'check').path).toBe('/health');
  });

  it('maps HTTP decorators to their method', () => {
    expect(users.endpoints).toHaveLength(7);
    expect(findEndpoint(users, 'findAll').httpMethod).toBe('GET');
    expect(findEndpoint(users, 'create').httpMethod).toBe('POST');
    expect(findEndpoint(users, 'replace').httpMethod).toBe('PUT');
    expect(findEndpoint(users, 'update').httpMethod).toBe('PATCH');
    expect(findEndpoint(users, 'remove').httpMethod).toBe('DELETE');
  });

  it('combines base path and method path, preserving route params', () => {
    expect(findEndpoint(users, 'findAll').path).toBe('/users');
    expect(findEndpoint(users, 'search').path).toBe('/users/search');
    expect(findEndpoint(users, 'findOne').path).toBe('/users/:id');
    expect(findEndpoint(users, 'remove').path).toBe('/users/:id');
  });

  it('extracts params with decorator, type and optionality', () => {
    const findOne = findEndpoint(users, 'findOne');
    expect(findParam(findOne.params, 'id')).toEqual<ParamSpec>({
      name: 'id',
      type: 'string',
      decorator: 'Param',
      isOptional: false,
    });
    expect(findParam(findOne.params, 'authorization').decorator).toBe('Headers');

    const search = findEndpoint(users, 'search');
    expect(findParam(search.params, 'q')).toEqual<ParamSpec>({
      name: 'q',
      type: 'string',
      decorator: 'Query',
      isOptional: true,
    });
  });

  it('detects the body type from @Body', () => {
    expect(findEndpoint(users, 'create').bodyType).toBe('CreateUserDto');
    expect(findEndpoint(users, 'replace').bodyType).toBe('UpdateUserDto');
    expect(findEndpoint(users, 'findAll').bodyType).toBeUndefined();
  });

  it('extracts return type and async flag', () => {
    expect(findEndpoint(users, 'findAll').returnType).toBe('Promise<string[]>');
    expect(findEndpoint(users, 'findAll').isAsync).toBe(true);
    expect(findEndpoint(users, 'remove').returnType).toBe('void');
    expect(findEndpoint(users, 'remove').isAsync).toBe(false);
  });

  it('records the source line and keeps methods ordered', () => {
    const lines = users.endpoints.map((endpoint) => endpoint.line);
    expect(lines.every((line) => line > 0)).toBe(true);
    expect([...lines].sort((a, b) => a - b)).toEqual(lines);
    expect(findEndpoint(users, 'findAll').line).toBeLessThan(findEndpoint(users, 'remove').line);
  });

  it('returns an empty spec when no controllers are found', () => {
    expect(parseNestProject(join(fixturesDir, 'does-not-exist'))).toEqual({ controllers: [] });
  });
});
