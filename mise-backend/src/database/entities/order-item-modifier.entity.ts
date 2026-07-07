import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Modifier } from './modifier.entity';

@Entity('order_item_modifiers')
export class OrderItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderItemId: string;

  @Column('uuid')
  modifierId: string;

  @ManyToOne(() => OrderItem, (oi) => oi.modifiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => Modifier)
  @JoinColumn({ name: 'modifier_id' })
  modifier: Modifier;

  @Column()
  nameSnapshot: string;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  priceDeltaSnapshot: number;
}
