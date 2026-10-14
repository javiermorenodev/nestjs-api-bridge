import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { DtoProperty } from '../models/index.js';
import { extractDto } from './dtos.js';

const simpleDto = `export interface UserDto {
  id: string;
  name: string;
  age?: number;
  tags: string[];
  address: Address;
}
`;

const decoratedDto = `import { IsEmail, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsEmail()
  email!: string;
}
`;

const internalDto = `class InternalDto {
  value: string;
}
`;

const ghostSource = `export class GhostDto {
  value: string;
}
`;

let fixturesDir: string;

function findProperty(properties: DtoProperty[], name: string): DtoProperty {
  const property = properties.find((candidate) => candidate.name === name);
  if (!property) {
    throw new Error(`Property ${name} not found`);
  }
  return property;
}

beforeAll(() => {
  fixturesDir = mkdtempSync(join(tmpdir(), 'nestjs-api-bridge-dtos-'));
  writeFileSync(join(fixturesDir, 'user.dto.ts'), simpleDto);
  writeFileSync(join(fixturesDir, 'update-user.dto.ts'), decoratedDto);
  writeFileSync(join(fixturesDir, 'internal.dto.ts'), internalDto);
  writeFileSync(join(fixturesDir, 'ghost.ts'), ghostSource);
});

afterAll(() => {
  rmSync(fixturesDir, { recursive: true, force: true });
});

describe('extractDto', () => {
  it('extracts an exported interface DTO with primitive and referenced types', () => {
    const dto = extractDto(fixturesDir, 'UserDto');

    expect(dto).toBeDefined();
    expect(dto?.name).toBe('UserDto');
    expect(dto?.filePath.endsWith('user.dto.ts')).toBe(true);
    expect(dto?.properties).toHaveLength(5);

    expect(findProperty(dto?.properties ?? [], 'id')).toEqual<DtoProperty>({
      name: 'id',
      type: 'string',
      isOptional: false,
    });
    expect(findProperty(dto?.properties ?? [], 'age')).toEqual<DtoProperty>({
      name: 'age',
      type: 'number',
      isOptional: true,
    });
    expect(findProperty(dto?.properties ?? [], 'tags').type).toBe('string[]');
    expect(findProperty(dto?.properties ?? [], 'address').type).toBe('Address');
  });

  it('extracts a class DTO with class-validator decorators', () => {
    const dto = extractDto(fixturesDir, 'UpdateUserDto');

    expect(dto).toBeDefined();
    expect(dto?.properties).toHaveLength(3);

    expect(findProperty(dto?.properties ?? [], 'name')).toEqual<DtoProperty>({
      name: 'name',
      type: 'string',
      isOptional: true,
      validators: ['IsOptional', 'IsString', 'MaxLength'],
    });
    expect(findProperty(dto?.properties ?? [], 'age')).toEqual<DtoProperty>({
      name: 'age',
      type: 'number',
      isOptional: true,
      validators: ['IsOptional', 'IsInt', 'Min'],
    });
    expect(findProperty(dto?.properties ?? [], 'email')).toEqual<DtoProperty>({
      name: 'email',
      type: 'string',
      isOptional: false,
      validators: ['IsEmail'],
    });
  });

  it('ignores non class-validator decorators', () => {
    const email = findProperty(extractDto(fixturesDir, 'UpdateUserDto')?.properties ?? [], 'email');
    expect(email.validators).not.toContain('ApiProperty');
  });

  it('returns undefined when the DTO does not exist', () => {
    expect(extractDto(fixturesDir, 'MissingDto')).toBeUndefined();
  });

  it('ignores DTOs that are not exported', () => {
    expect(extractDto(fixturesDir, 'InternalDto')).toBeUndefined();
  });

  it('only looks at *.dto.ts files', () => {
    expect(extractDto(fixturesDir, 'GhostDto')).toBeUndefined();
  });

  it('returns undefined when the directory has no DTO files', () => {
    expect(extractDto(join(fixturesDir, 'does-not-exist'), 'UserDto')).toBeUndefined();
  });
});
