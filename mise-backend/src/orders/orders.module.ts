import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderItemModifier } from '../database/entities/order-item-modifier.entity';
import { OrderEvent } from '../database/entities/order-event.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { Modifier } from '../database/entities/modifier.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SessionsModule } from '../sessions/sessions.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderItemModifier, OrderEvent, MenuItem, Modifier]),
    SessionsModule,
    WebsocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
