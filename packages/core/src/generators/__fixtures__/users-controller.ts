import type { ControllerSpec } from '../../models/index.js';

export const usersController: ControllerSpec = {
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

export const healthController: ControllerSpec = {
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
