import { IsArray, IsIn, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemInputDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addOnIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderAddressDto {
  @IsString() label: string;
  @IsString() line1: string;
  @IsOptional() @IsString() line2?: string;
  @IsString() city: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() phone?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsIn(['DELIVERY', 'PICKUP'])
  fulfillment: string;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderAddressDto)
  address?: OrderAddressDto;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsIn(['CARD', 'CASH', 'WALLET'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  @MinLength(0)
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
  status: string;

  @IsOptional()
  @IsString()
  note?: string;
}
