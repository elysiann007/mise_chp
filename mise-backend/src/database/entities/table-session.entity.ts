import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Table } from './table.entity';
import { Order } from './order.entity';
import { SessionStatus } from '../../shared/enums/session-status.enum';

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  tableId: string;

  @ManyToOne(() => Table, (t) => t.sessions)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @Index('idx_session_token', { unique: true })
  @Column({ unique: true })
  sessionToken: string;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @CreateDateColumn()
  openedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date;

  @Column('uuid', { nullable: true })
  openedByUserId: string;

  @OneToMany(() => Order, (o) => o.session)
  orders: Order[];
}
