import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentIntentDto } from './dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('intent')
  createIntent(@Body() dto: PaymentIntentDto) {
    return this.payments.createIntent(dto);
  }

  @Get('verify/:reference')
  verify(@Param('reference') reference: string) {
    return this.payments.verify(reference);
  }
}
