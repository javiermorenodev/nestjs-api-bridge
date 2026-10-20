import { describe, expect, it } from 'vitest';
import type { ControllerSpec } from '../models/index.js';
import { generateAngularService } from './angular.js';

const usersController: ControllerSpec = {
  name: 'UsersController',
  basePath: '/users',
  filePath: '/project/src/users/users.controller.ts',
  endpoints: [
    {
      name: 'findAll',
      httpMethod: 'GET',
      path: '/users',
      params: [],
      returnType: 'Promise<string[]>',
      line: 10,
      isAsync: true,
    },
    {
      name: 'findOne',
      httpMethod: 'GET',
      path: '/users/:id',
      params: [{ name: 'id', type: 'string', decorator: 'Param', isOptional: false }],
      returnType: 'Promise<UserDto>',
      line: 20,
      isAsync: true,
    },
    {
      name: 'search',
      httpMethod: 'GET',
      path: '/users/search',
      params: [{ name: 'q', type: 'string', decorator: 'Query', isOptional: true }],
      returnType: 'Promise<string[]>',
      line: 30,
      isAsync: true,
    },
    {
      name: 'create',
      httpMethod: 'POST',
      path: '/users',
      params: [{ name: 'dto', type: 'CreateUserDto', decorator: 'Body', isOptional: false }],
      bodyType: 'CreateUserDto',
      returnType: 'Promise<UserDto>',
      line: 40,
      isAsync: true,
    },
    {
      name: 'replace',
      httpMethod: 'PUT',
      path: '/users/:id',
      params: [
        { name: 'id', type: 'string', decorator: 'Param', isOptional: false },
        { name: 'dto', type: 'UpdateUserDto', decorator: 'Body', isOptional: false },
      ],
      bodyType: 'UpdateUserDto',
      returnType: 'string',
      line: 50,
      isAsync: false,
    },
    {
      name: 'update',
      httpMethod: 'PATCH',
      path: '/users/:id',
      params: [
        { name: 'id', type: 'string', decorator: 'Param', isOptional: false },
        { name: 'dto', type: 'UpdateUserDto', decorator: 'Body', isOptional: false },
      ],
      bodyType: 'UpdateUserDto',
      returnType: 'Promise<void>',
      line: 60,
      isAsync: true,
    },
    {
      name: 'remove',
      httpMethod: 'DELETE',
      path: '/users/:id',
      params: [{ name: 'id', type: 'string', decorator: 'Param', isOptional: false }],
      returnType: 'void',
      line: 70,
      isAsync: false,
    },
  ],
};

const healthController: ControllerSpec = {
  name: 'HealthController',
  basePath: '',
  filePath: '/project/src/health.controller.ts',
  endpoints: [
    {
      name: 'check',
      httpMethod: 'GET',
      path: '/health',
      params: [],
      returnType: 'string',
      line: 5,
      isAsync: false,
    },
  ],
};

describe('generateAngularService', () => {
  it('generates a complete Angular service with all HTTP verbs', () => {
    const output = generateAngularService(usersController);

    expect(output).toContain("@Injectable({ providedIn: 'root' })");
    expect(output).toContain("private readonly baseUrl = '/users';");
    expect(output).toContain('constructor(private http: HttpClient) {}');
    expect(output).toContain('import { Observable } from');
    expect(output).toContain("import type { UserDto } from './user-dto';");
    expect(output).toContain("import type { CreateUserDto } from './create-user-dto';");
    expect(output).toContain("import type { UpdateUserDto } from './update-user-dto';");
    expect(output).toContain('return this.http.get<string[]>(`${this.baseUrl}`);');
    expect(output).toContain('return this.http.get<UserDto>(`${this.baseUrl}/${id}`);');
    expect(output).toContain('return this.http.post<UserDto>(`${this.baseUrl}`, dto);');
    expect(output).toContain('return this.http.put<string>(`${this.baseUrl}/${id}`, dto);');
    expect(output).toContain('return this.http.patch<void>(`${this.baseUrl}/${id}`, dto);');
    expect(output).toContain('return this.http.delete<void>(`${this.baseUrl}/${id}`);');

    expect(output).toMatchSnapshot();
  });

  it('omits HttpParams when no endpoint uses query params', () => {
    const output = generateAngularService(healthController);

    expect(output).toContain("import { HttpClient } from '@angular/common/http';");
    expect(output).not.toContain('HttpParams');
    expect(output).toMatchSnapshot();
  });
});
