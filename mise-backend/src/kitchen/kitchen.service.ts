import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderEvent } from '../database/entities/order-event.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import {
  OrderStatus,
  OrderItemStatus,
} from '../shared/enums/order-status.enum';
import { PrepStation } from '../shared/enums/prep-station.enum';
import { OrdersGateway } from '../websocket/orders.gateway';
import type { UpdateItemStatusDto } from './dto/update-item-status.dto';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

const ACTIVE_ORDER_STATUSES = [OrderStatus.PLACED, OrderStatus.PREPARING];
const ACTIVE_ITEM_STATUSES = [
  OrderItemStatus.PENDING,
  OrderItemStatus.PREPARING,
];

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
    @InjectRepository(OrderEvent) private eventRepo: Repository<OrderEvent>,
    private gateway: OrdersGateway,
  ) {}

  async getActiveOrders(restaurantId: string, station?: PrepStation) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.session', 'session')
      .innerJoinAndSelect('session.table', 'table')
      .innerJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.modifiers', 'modifier')
      .where('table.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('order.status IN (:...statuses)', {
        statuses: ACTIVE_ORDER_STATUSES,
      })
      .andWhere('item.status IN (:...itemStatuses)', {
        itemStatuses: ACTIVE_ITEM_STATUSES,
      })
      .orderBy('order.placed_at', 'ASC');

    if (station) {
      qb.andWhere('item.prep_station = :station', { station });
    }

    return qb.getMany();
  }

  async updateItemStatus(
    itemId: string,
    dto: UpdateItemStatusDto,
    actor: JwtPayload,
  ) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: [
        'order',
        'order.session',
        'order.session.table',
        'order.items',
      ],
    });

    if (!item || item.order.session.table.restaurantId !== actor.restaurantId) {
      throw new BusinessException('ORDER_ITEM_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    item.status = dto.status;
    await this.itemRepo.save(item);

    await this.eventRepo.save(
      this.eventRepo.create({
        orderId: item.orderId,
        eventType: `item_${dto.status}`,
        actorUserId: actor.sub,
        meta: { itemId: item.id },
      }),
    );

    const updatedOrder = await this.syncOrderStatus(item.order);
    const sessionToken = item.order.session.sessionToken;
    this.gateway.notifyOrderStatusChanged(
      actor.restaurantId,
      sessionToken,
      updatedOrder,
    );

    return item;
  }

  private async syncOrderStatus(order: Order): Promise<Order> {
    const items = await this.itemRepo.find({ where: { orderId: order.id } });

    const allServed = items.every((i) => i.status === OrderItemStatus.SERVED);
    const allReadyOrServed = items.every((i) =>
      [OrderItemStatus.READY, OrderItemStatus.SERVED].includes(i.status),
    );
    const anyPreparing = items.some(
      (i) => i.status === OrderItemStatus.PREPARING,
    );
    const allCancelled = items.every(
      (i) => i.status === OrderItemStatus.CANCELLED,
    );

    let newStatus = order.status;
    if (allServed || allCancelled)
      newStatus = allCancelled ? OrderStatus.CANCELLED : OrderStatus.SERVED;
    else if (allReadyOrServed) newStatus = OrderStatus.READY;
    else if (anyPreparing) newStatus = OrderStatus.PREPARING;

    if (newStatus !== order.status) {
      await this.orderRepo.update(order.id, { status: newStatus });
      order.status = newStatus;
    }

    return this.orderRepo.findOne({
      where: { id: order.id },
      relations: ['items', 'items.modifiers', 'session', 'session.table'],
    }) as Promise<Order>;
  }
}
