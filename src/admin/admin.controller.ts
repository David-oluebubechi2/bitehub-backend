import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { IsBoolean, IsIn } from 'class-validator';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/types';
import { AdminService } from './admin.service';

class SetRoleDto {
  @IsIn(['ADMIN', 'CUSTOMER'])
  role: Role;
}

class SetActiveDto {
  @IsBoolean()
  active: boolean;
}

@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  stats() {
    return this.admin.stats();
  }

  @Get('activity')
  activity() {
    return this.admin.recentActivity();
  }

  @Patch('users/:id/role')
  setRole(@Param('id') id: string, @Body() dto: SetRoleDto) {
    return this.admin.setRole(id, dto.role);
  }

  @Patch('users/:id/active')
  setActive(@Param('id') id: string, @Body() dto: SetActiveDto) {
    return this.admin.setActive(id, dto.active);
  }
}
