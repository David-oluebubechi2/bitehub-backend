import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class SupportFaqDto {
  @IsString()
  @MaxLength(200)
  question: string;

  @IsString()
  @MaxLength(1000)
  answer: string;
}

export class UpdateSupportDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  hours?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  responseTime?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportFaqDto)
  faqs?: SupportFaqDto[];
}
