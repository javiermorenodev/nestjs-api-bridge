import { describe, expect, it } from 'vitest';
import { usersController } from './__fixtures__/users-controller.js';
import { generateVueComposable } from './vue.js';

describe('generateVueComposable', () => {
  it('generates a composable exposing every endpoint', () => {
    const output = generateVueComposable(usersController);

    expect(output).toContain("import { ref } from 'vue';");
    expect(output).toContain("import * as service from './users.service';");
    expect(output).toContain('export function useUsers() {');
    expect(output).toContain(
      'findAll: (...args: Parameters<typeof service.findAll>) => run(() => service.findAll(...args)),',
    );
    expect(output).toContain(
      'remove: (...args: Parameters<typeof service.remove>) => run(() => service.remove(...args)),',
    );
    expect(output).toMatchSnapshot();
  });
});
