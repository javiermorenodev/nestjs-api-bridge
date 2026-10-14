import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ProductsController } from './products/products.controller';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  controllers: [UsersController, AuthController, ProductsController],
  providers: [UsersService],
})
export class AppModule {}
