import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PlaceOrderDto } from './dto/place-order.dto';

@Controller('api/v1')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('sessions/:token/orders')
  placeOrder(@Param('token') token: string, @Body() dto: PlaceOrderDto) {
    return this.ordersService.placeOrder(token, dto);
  }

  @Get('sessions/:token/orders')
  getSessionOrders(@Param('token') token: string) {
    return this.ordersService.getSessionOrders(token);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string, @Query('sessionToken') sessionToken?: string) {
    return this.ordersService.getById(id, sessionToken);
  }
}
