import { describe, expect, it } from 'vitest';
import { healthController, usersController } from './__fixtures__/users-controller.js';
import { generateReactHooks } from './react.js';

describe('generateReactHooks', () => {
  it('generates query and mutation hooks', () => {
    const output = generateReactHooks(usersController);

    expect(output).toContain("import { useCallback, useEffect, useState } from 'react';");
    expect(output).toContain("import * as service from './users.service';");
    expect(output).toContain('export function useUsersFindAll()');
    expect(output).toContain('export function useUsersFindOne(id: string)');
    expect(output).toContain('export function useUsersSearch(q?: string)');
    expect(output).toContain('export function useUsersCreate()');
    expect(output).toContain('await service.findAll()');
    expect(output).toContain('await service.findOne(id)');
    expect(output).toContain('await service.create(...args)');
    expect(output).toMatchSnapshot();
  });

  it('generates a single query hook for a minimal controller', () => {
    const output = generateReactHooks(healthController);

    expect(output).toContain('export function useHealthCheck()');
    expect(output).toContain("import * as service from './health.service';");
    expect(output).toMatchSnapshot();
  });
});
