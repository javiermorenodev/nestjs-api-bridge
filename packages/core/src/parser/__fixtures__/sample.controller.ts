import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';

export class CreateUserDto {
  name!: string;
}

export class UpdateUserDto {
  name?: string;
}

@Controller('users')
export class UsersController {
  @Get()
  async findAll(): Promise<string[]> {
    return [];
  }

  @Get('search')
  async search(@Query('q') q?: string): Promise<string[]> {
    return q ? [q] : [];
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ): Promise<string> {
    return `${id}-${authorization}`;
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<CreateUserDto> {
    return dto;
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() dto: UpdateUserDto): string {
    return `${id}-${dto.name ?? ''}`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): void {
    void id;
    void dto;
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    void id;
  }
}

@Controller()
export class HealthController {
  @Get('health')
  check(): string {
    return 'ok';
  }
}
