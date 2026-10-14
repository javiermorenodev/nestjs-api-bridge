import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;
}
