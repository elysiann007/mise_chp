import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from './menu-item.entity';
import { OrderItemModifier } from './order-item-modifier.entity';
import { OrderItemStatus } from '../../shared/enums/order-status.enum';
import { PrepStation } from '../../shared/enums/prep-station.enum';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Column('uuid')
  menuItemId: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => MenuItem)
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column()
  quantity: number;

  @Column('numeric', { precision: 10, scale: 2 })
  unitPriceSnapshot: number;

  @Column('numeric', { precision: 4, scale: 2 })
  kdzRateSnapshot: number;

  @Column('numeric', { precision: 4, scale: 2, default: 0 })
  otvRateSnapshot: number;

  @Column()
  nameSnapshot: string;

  @Index('idx_prep_station_status')
  @Column({ type: 'enum', enum: PrepStation, default: PrepStation.KITCHEN })
  prepStation: PrepStation;

  @Column({ type: 'enum', enum: OrderItemStatus, default: OrderItemStatus.PENDING })
  status: OrderItemStatus;

  @Column({ nullable: true })
  itemNote: string;

  @OneToMany(() => OrderItemModifier, (m) => m.orderItem, { cascade: true })
  modifiers: OrderItemModifier[];
}
