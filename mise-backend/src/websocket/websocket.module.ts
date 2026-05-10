import { Module } from '@nestjs/common';
import { OrdersGateway } from './orders.gateway';

@Module({
  providers: [OrdersGateway],
  exports: [OrdersGateway],
})
export class WebsocketModule {}
