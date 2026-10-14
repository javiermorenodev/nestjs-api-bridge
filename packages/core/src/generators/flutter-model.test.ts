import { describe, expect, it } from 'vitest';
import type { DtoSpec } from '../models/index.js';
import { generateFlutterModel } from './flutter-model.js';

const createUserDto: DtoSpec = {
  name: 'CreateUserDto',
  filePath: '/project/src/users/dto/create-user.dto.ts',
  properties: [
    { name: 'name', type: 'string', isOptional: false },
    { name: 'age', type: 'number', isOptional: true },
    { name: 'price', type: 'number', isOptional: false },
    { name: 'active', type: 'boolean', isOptional: false },
    { name: 'createdAt', type: 'Date', isOptional: false },
    { name: 'updatedAt', type: 'Date', isOptional: true },
    { name: 'tags', type: 'string[]', isOptional: false },
    { name: 'roles', type: 'string[]', isOptional: true },
    { name: 'address', type: 'AddressDto', isOptional: true },
    { name: 'friends', type: 'UserDto[]', isOptional: false },
  ],
};

describe('generateFlutterModel', () => {
  it('maps TypeScript types to Dart and generates fromJson/toJson', () => {
    const output = generateFlutterModel(createUserDto);

    expect(output).toContain('class CreateUserDto {');
    expect(output).toContain('const CreateUserDto({');
    expect(output).toContain('required this.name,');
    expect(output).toContain('this.age,');

    expect(output).toContain('final String name;');
    expect(output).toContain('final int? age;');
    expect(output).toContain('final double price;');
    expect(output).toContain('final bool active;');
    expect(output).toContain('final DateTime createdAt;');
    expect(output).toContain('final DateTime? updatedAt;');
    expect(output).toContain('final List<String> tags;');
    expect(output).toContain('final List<String>? roles;');
    expect(output).toContain('final AddressDto? address;');
    expect(output).toContain('final List<UserDto> friends;');

    expect(output).toContain("name: json['name'] as String,");
    expect(output).toContain("age: json['age'] == null ? null : json['age'] as int,");
    expect(output).toContain("createdAt: DateTime.parse(json['createdAt'] as String),");
    expect(output).toContain("tags: List<String>.from(json['tags'] as List),");
    expect(output).toContain(
      "address: json['address'] == null ? null : AddressDto.fromJson(json['address'] as Map<String, dynamic>),",
    );
    expect(output).toContain(
      "friends: (json['friends'] as List).map((e) => UserDto.fromJson(e as Map<String, dynamic>)).toList(),",
    );

    expect(output).toContain("'createdAt': createdAt.toIso8601String(),");
    expect(output).toContain("if (age != null) 'age': age,");
    expect(output).toContain("if (address != null) 'address': address.toJson(),");

    expect(output).toMatchSnapshot();
  });

  it('generates an empty model when the DTO has no properties', () => {
    const output = generateFlutterModel({ name: 'EmptyDto', filePath: 'x.ts', properties: [] });

    expect(output).toContain('class EmptyDto {');
    expect(output).toContain('factory EmptyDto.fromJson(Map<String, dynamic> json) {');
    expect(output).toMatchSnapshot();
  });
});
