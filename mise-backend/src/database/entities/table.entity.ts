import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { TableSession } from './table-session.entity';

@Entity('tables')
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurantId: string;

  @ManyToOne(() => Restaurant, (r) => r.tables)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column()
  label: string;

  @Index('idx_qr_token', { unique: true })
  @Column({ unique: true })
  qrToken: string;

  @Column({ nullable: true })
  aprilTagId: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TableSession, (s) => s.table)
  sessions: TableSession[];
}
