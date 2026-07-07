import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModifierGroup } from './modifier-group.entity';

@Entity('modifiers')
export class Modifier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  groupId: string;

  @ManyToOne(() => ModifierGroup, (g) => g.modifiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: ModifierGroup;

  @Column()
  name: string;

  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  priceDelta: number;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: 0 })
  sortOrder: number;
}
