import { describe, expect, it } from 'vitest';
import type { ControllerSpec } from '../models/index.js';
import { generateFlutterApi } from './flutter-api.js';

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

describe('generateFlutterApi', () => {
  it('generates a Dart API client with Dio for every HTTP verb', () => {
    const output = generateFlutterApi(usersController);

    expect(output).toContain("import 'package:dio/dio.dart';");
    expect(output).toContain('class UsersApi {');
    expect(output).toContain('final Dio _dio;');
    expect(output).toContain('UsersApi(this._dio);');

    expect(output).toContain('Future<List<String>> findAll() async {');
    expect(output).toContain("final res = await _dio.get('/users');");
    expect(output).toContain('return List<String>.from(res.data as List);');

    expect(output).toContain('Future<UserDto> findOne(String id) async {');
    expect(output).toContain("final res = await _dio.get('/users/$id');");
    expect(output).toContain('return UserDto.fromJson(res.data as Map<String, dynamic>);');

    expect(output).toContain(
      "final res = await _dio.get('/users/search', queryParameters: {'q': q});",
    );
    expect(output).toContain("final res = await _dio.post('/users', data: dto.toJson());");
    expect(output).toContain("final res = await _dio.put('/users/$id', data: dto.toJson());");
    expect(output).toContain("await _dio.patch('/users/$id', data: dto.toJson());");
    expect(output).toContain("await _dio.delete('/users/$id');");

    expect(output).toMatchSnapshot();
  });

  it('generates a client without a body for simple primitive endpoints', () => {
    const output = generateFlutterApi(healthController);

    expect(output).toContain('class HealthApi {');
    expect(output).toContain('Future<String> check() async {');
    expect(output).toContain("final res = await _dio.get('/health');");
    expect(output).toContain('return res.data as String;');
    expect(output).not.toContain('.toJson()');

    expect(output).toMatchSnapshot();
  });
});
