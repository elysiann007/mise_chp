import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { PrepStation } from '../shared/enums/prep-station.enum';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('api/v1/kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.ADMIN,
  UserRole.MANAGER,
  UserRole.KITCHEN,
  UserRole.BAR,
  UserRole.WAITER,
)
export class KitchenController {
  constructor(private kitchenService: KitchenService) {}

  @Get('orders')
  getActiveOrders(
    @CurrentUser() user: JwtPayload,
    @Query('station') station?: PrepStation,
  ) {
    return this.kitchenService.getActiveOrders(user.restaurantId, station);
  }

  @Patch('items/:id/status')
  updateItemStatus(
    @Param('id') id: string,
    @Body() dto: UpdateItemStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.kitchenService.updateItemStatus(id, dto, user);
  }
}
