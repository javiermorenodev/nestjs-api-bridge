import { describe, expect, it } from 'vitest';
import { healthController, usersController } from './__fixtures__/users-controller.js';
import { generateFetchService } from './fetch-service.js';

describe('generateFetchService', () => {
  it('generates a typed fetch service with model imports', () => {
    const output = generateFetchService(usersController);

    expect(output).toContain("import type { UserDto } from './user-dto.model';");
    expect(output).toContain("import type { CreateUserDto } from './create-user-dto.model';");
    expect(output).toContain("import type { UpdateUserDto } from './update-user-dto.model';");
    expect(output).toContain('export async function findAll(): Promise<string[]> {');
    expect(output).toContain("return request<string[]>(`/users`, { method: 'GET' });");
    expect(output).toContain("return request<UserDto>(`/users/${id}`, { method: 'GET' });");
    expect(output).toContain('const query = new URLSearchParams();');
    expect(output).toContain("query.set('q', String(q));");
    expect(output).toContain('body: JSON.stringify(dto)');
    expect(output).toMatchSnapshot();
  });

  it('uses an empty base url by default and accepts an override', () => {
    expect(generateFetchService(healthController)).toContain("const BASE_URL = '';");
    expect(generateFetchService(healthController, { baseUrl: 'https://api.test' })).toContain(
      "const BASE_URL = 'https://api.test';",
    );
  });
});
