import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

export interface AuthResult {
  accessToken: string;
}

interface StoredUser {
  id: number;
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  private readonly users: StoredUser[] = [{ id: 1, email: 'ada@example.com', password: 'secret' }];

  private nextId = 2;

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResult> {
    const user = this.users.find((item) => item.email === dto.email);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: `token-${user.id}` };
  }

  @Post('register')
  async register(@Body() dto: LoginDto): Promise<AuthResult> {
    const user: StoredUser = { id: this.nextId++, ...dto };
    this.users.push(user);
    return { accessToken: `token-${user.id}` };
  }
}
