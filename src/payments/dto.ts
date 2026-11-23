import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class PaymentIntentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn(['CARD', 'CASH', 'WALLET'])
  method: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}
