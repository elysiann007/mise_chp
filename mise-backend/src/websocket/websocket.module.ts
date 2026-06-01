import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersGateway } from './orders.gateway';

@Module({
  imports: [AuthModule],
  providers: [OrdersGateway],
  exports: [OrdersGateway],
})
export class WebsocketModule {}
