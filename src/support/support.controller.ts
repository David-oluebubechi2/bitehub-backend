import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Public } from '../common/public.decorator';
import { Roles } from '../common/roles.decorator';
import { UpdateSupportDto } from './dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Public()
  @Get()
  get() {
    return this.support.get();
  }

  @Roles('ADMIN')
  @Patch()
  update(@Body() dto: UpdateSupportDto) {
    return this.support.update(dto);
  }
}
