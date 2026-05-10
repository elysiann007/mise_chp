import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TableSession } from './table-session.entity';
import { OrderItem } from './order-item.entity';
import { OrderEvent } from './order-event.entity';
import { OrderStatus } from '../../shared/enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  sessionId: string;

  @Index('idx_session_placed')
  @ManyToOne(() => TableSession, (s) => s.orders)
  @JoinColumn({ name: 'session_id' })
  session: TableSession;

  @Column({ default: 1 })
  sequenceNo: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PLACED })
  status: OrderStatus;

  @CreateDateColumn()
  placedAt: Date;

  @Column({ nullable: true })
  customerNote: string;

  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true })
  items: OrderItem[];

  @OneToMany(() => OrderEvent, (e) => e.order)
  events: OrderEvent[];
}
