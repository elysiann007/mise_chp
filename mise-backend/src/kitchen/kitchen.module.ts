import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KitchenController } from './kitchen.controller';
import { KitchenService } from './kitchen.service';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderEvent } from '../database/entities/order-event.entity';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderEvent]),
    WebsocketModule,
  ],
  controllers: [KitchenController],
  providers: [KitchenService],
})
export class KitchenModule {}
