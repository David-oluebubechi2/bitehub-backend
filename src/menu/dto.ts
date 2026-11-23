import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddOnDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  emoji: string;

  @IsOptional()
  @IsString()
  gradient?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateCategoryDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() gradient?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsNumber() sortOrder?: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() compareAtPrice?: number;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() gradient?: string;
  @IsOptional() @IsBoolean() available?: boolean;
  @IsOptional() @IsBoolean() popular?: boolean;
  @IsOptional() @IsNumber() prepTime?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AddOnDto) addOns?: AddOnDto[];
}

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsNumber() compareAtPrice?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() emoji?: string;
  @IsOptional() @IsString() gradient?: string;
  @IsOptional() @IsBoolean() available?: boolean;
  @IsOptional() @IsBoolean() popular?: boolean;
  @IsOptional() @IsNumber() prepTime?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AddOnDto) addOns?: AddOnDto[];
}

export class ProductQueryDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(['popular', 'price-asc', 'price-desc', 'rating', 'newest']) sort?: string;
  @IsOptional() @IsBoolean() available?: boolean;
}
