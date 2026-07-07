import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_events')
export class OrderEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  orderId: string;

  @Index('idx_order_occurred')
  @ManyToOne(() => Order, (o) => o.events)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column()
  eventType: string;

  @Column('uuid', { nullable: true })
  actorUserId: string;

  @CreateDateColumn()
  occurredAt: Date;

  @Column('jsonb', { nullable: true })
  meta: Record<string, any>;
}
