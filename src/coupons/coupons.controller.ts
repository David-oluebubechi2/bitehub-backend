import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { Roles } from '../common/roles.decorator';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto } from './dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Get('active')
  @Public()
  active() {
    return this.coupons.findActive();
  }

  @Get('validate')
  validate(@Query('code') code: string, @Query('subtotal') subtotal: string) {
    return this.coupons.validate(code || '', Number(subtotal) || 0);
  }

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.coupons.findAll();
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateCouponDto) {
    return this.coupons.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.coupons.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.coupons.delete(id);
  }
}
