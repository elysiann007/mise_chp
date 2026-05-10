import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../database/entities/order.entity';
import { OrderItem } from '../database/entities/order-item.entity';
import { OrderItemModifier } from '../database/entities/order-item-modifier.entity';
import { OrderEvent } from '../database/entities/order-event.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { ModifierGroup } from '../database/entities/modifier-group.entity';
import { Modifier } from '../database/entities/modifier.entity';
import { SessionsService } from '../sessions/sessions.service';
import { BusinessException } from '../common/exceptions/business.exception';
import { OrderStatus } from '../shared/enums/order-status.enum';
import { ALCOHOL_BLOCK_END_HOUR, ALCOHOL_BLOCK_START_HOUR } from '../shared/constants/tax-rates.constant';
import { PlaceOrderDto } from './dto/place-order.dto';
import { OrdersGateway } from '../websocket/orders.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderItemModifier)
    private readonly orderItemModifierRepo: Repository<OrderItemModifier>,
    @InjectRepository(OrderEvent)
    private readonly orderEventRepo: Repository<OrderEvent>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepo: Repository<MenuItem>,
    @InjectRepository(Modifier)
    private readonly modifierRepo: Repository<Modifier>,
    private readonly sessionsService: SessionsService,
    private readonly ordersGateway: OrdersGateway,
  ) {}

  async placeOrder(sessionToken: string, dto: PlaceOrderDto) {
    const session = await this.sessionsService.validateSession(sessionToken);

    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.menuItemRepo.find({
      where: { id: In(menuItemIds), restaurantId: session.table.restaurantId },
      relations: ['modifierGroups', 'modifierGroups.modifiers'],
    });
    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    for (const item of dto.items) {
      const menuItem = menuItemMap.get(item.menuItemId);
      if (!menuItem) {
        throw new BusinessException('MENU_ITEM_NOT_FOUND', HttpStatus.NOT_FOUND, `Ürün bulunamadı: ${item.menuItemId}`);
      }
      if (!menuItem.isActive) {
        throw new BusinessException('MENU_ITEM_UNAVAILABLE', HttpStatus.UNPROCESSABLE_ENTITY, `Ürün şu an mevcut değil: ${menuItem.name}`);
      }
    }

    this.checkAlcoholRestriction(menuItemMap, dto);
    this.validateModifiers(menuItemMap, dto);

    const orderCount = await this.orderRepo.count({ where: { sessionId: session.id } });

    const order = this.orderRepo.create({
      sessionId: session.id,
      sequenceNo: orderCount + 1,
      status: OrderStatus.PLACED,
      customerNote: dto.customerNote,
    });

    await this.orderRepo.save(order);

    const allModifierIds = dto.items.flatMap((i) => i.modifiers?.map((m) => m.modifierId) ?? []);
    const allModifiers = allModifierIds.length
      ? await this.modifierRepo
          .createQueryBuilder('mod')
          .innerJoin('mod.group', 'grp')
          .innerJoin('grp.menuItem', 'item')
          .where('mod.id IN (:...ids)', { ids: allModifierIds })
          .andWhere('item.restaurantId = :restaurantId', { restaurantId: session.table.restaurantId })
          .getMany()
      : [];
    const modifierMap = new Map(allModifiers.map((m) => [m.id, m]));

    const orderItems = dto.items.map((itemDto) => {
      const menuItem = menuItemMap.get(itemDto.menuItemId)!;
      return this.orderItemRepo.create({
        orderId: order.id,
        menuItemId: menuItem.id,
        quantity: itemDto.quantity,
        unitPriceSnapshot: Number(menuItem.basePrice),
        kdzRateSnapshot: Number(menuItem.kdzRate),
        otvRateSnapshot: Number(menuItem.otvRate),
        nameSnapshot: menuItem.name,
        prepStation: menuItem.prepStation,
        itemNote: itemDto.itemNote,
      });
    });

    const savedItems = await this.orderItemRepo.save(orderItems);

    const allOims = savedItems.flatMap((savedItem, i) =>
      (dto.items[i].modifiers ?? []).flatMap((modDto) => {
        const mod = modifierMap.get(modDto.modifierId);
        if (!mod) return [];
        return [this.orderItemModifierRepo.create({
          orderItemId: savedItem.id,
          modifierId: mod.id,
          nameSnapshot: mod.name,
          priceDeltaSnapshot: Number(mod.priceDelta),
        })];
      }),
    );

    if (allOims.length) await this.orderItemModifierRepo.save(allOims);

    await this.orderEventRepo.save(
      this.orderEventRepo.create({ orderId: order.id, eventType: 'placed' }),
    );

    const fullOrder = await this.getById(order.id);
    this.ordersGateway.notifyOrderPlaced(session.table.restaurantId, fullOrder);

    return fullOrder;
  }

  async getById(orderId: string, sessionToken?: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['items', 'items.modifiers', 'session', 'session.table'],
    });

    if (!order) {
      throw new BusinessException('ORDER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (sessionToken !== undefined && order.session.sessionToken !== sessionToken) {
      throw new BusinessException('ORDER_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  async getSessionOrders(sessionToken: string) {
    const session = await this.sessionsService.validateSession(sessionToken);

    return this.orderRepo.find({
      where: { sessionId: session.id },
      relations: ['items', 'items.modifiers'],
      order: { placedAt: 'ASC' },
    });
  }

  private validateModifiers(menuItemMap: Map<string, MenuItem>, dto: PlaceOrderDto) {
    for (const itemDto of dto.items) {
      const menuItem = menuItemMap.get(itemDto.menuItemId)!;
      const submittedModIds = itemDto.modifiers?.map((m) => m.modifierId) ?? [];

      const groupByModId = new Map<string, ModifierGroup>();
      for (const group of menuItem.modifierGroups) {
        for (const mod of group.modifiers) {
          groupByModId.set(mod.id, group);
        }
      }

      for (const modId of submittedModIds) {
        if (!groupByModId.has(modId)) {
          throw new BusinessException('MODIFIER_NOT_FOUND', HttpStatus.UNPROCESSABLE_ENTITY, 'Geçersiz seçenek.');
        }
      }

      const countsByGroup = new Map<string, number>();
      for (const modId of submittedModIds) {
        const group = groupByModId.get(modId)!;
        countsByGroup.set(group.id, (countsByGroup.get(group.id) ?? 0) + 1);
      }

      for (const group of menuItem.modifierGroups) {
        const count = countsByGroup.get(group.id) ?? 0;
        if (group.isRequired && count === 0) {
          throw new BusinessException('MODIFIER_REQUIRED', HttpStatus.UNPROCESSABLE_ENTITY, `"${group.name}" seçimi zorunludur.`);
        }
        if (count < group.minSelect) {
          throw new BusinessException('MODIFIER_MIN_SELECT', HttpStatus.UNPROCESSABLE_ENTITY, `"${group.name}" için en az ${group.minSelect} seçim gereklidir.`);
        }
        if (count > group.maxSelect) {
          throw new BusinessException('MODIFIER_MAX_SELECT', HttpStatus.UNPROCESSABLE_ENTITY, `"${group.name}" için en fazla ${group.maxSelect} seçim yapılabilir.`);
        }
      }
    }
  }

  private checkAlcoholRestriction(menuItemMap: Map<string, MenuItem>, dto: PlaceOrderDto) {
    const hasAlcohol = dto.items.some((itemDto) => menuItemMap.get(itemDto.menuItemId)?.isAlcohol);

    if (!hasAlcohol) return;

    const hour = new Date().getHours();
    const isBlocked = hour >= ALCOHOL_BLOCK_START_HOUR || hour < ALCOHOL_BLOCK_END_HOUR;

    if (isBlocked) {
      throw new BusinessException(
        'ALCOHOL_SALES_BLOCKED',
        HttpStatus.FORBIDDEN,
        'Alkollü içecekler 22:00–06:00 saatleri arasında satılamaz.',
      );
    }
  }
}
