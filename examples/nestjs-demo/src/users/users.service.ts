import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

interface StoredUser extends UserResponseDto {
  password: string;
}

@Injectable()
export class UsersService {
  private readonly users: StoredUser[] = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret' },
    { id: 2, name: 'Alan Turing', email: 'alan@example.com', password: 'secret' },
  ];

  private nextId = 3;

  findAll(): UserResponseDto[] {
    return this.users.map(toResponse);
  }

  findOne(id: number): UserResponseDto {
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return toResponse(user);
  }

  create(dto: CreateUserDto): UserResponseDto {
    const user: StoredUser = { id: this.nextId++, ...dto, password: 'secret' };
    this.users.push(user);
    return toResponse(user);
  }

  update(id: number, dto: UpdateUserDto): UserResponseDto {
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    Object.assign(user, dto);
    return toResponse(user);
  }

  remove(id: number): void {
    const index = this.users.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`User ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}

function toResponse(user: StoredUser): UserResponseDto {
  const { password: _password, ...rest } = user;
  return rest;
}
