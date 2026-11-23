import { IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  subtotal: number;
}

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsIn(['PERCENT', 'FIXED', 'FREE_SHIPPING'])
  type: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional() @IsNumber() @Min(0) minOrder?: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsDateString() expiresAt?: string;
}

export class UpdateCouponDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsIn(['PERCENT', 'FIXED', 'FREE_SHIPPING']) type?: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  @IsOptional() @IsNumber() @Min(0) value?: number;
  @IsOptional() @IsNumber() @Min(0) minOrder?: number;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsDateString() expiresAt?: string;
}
