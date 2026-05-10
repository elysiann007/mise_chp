import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';
import { Modifier } from './modifier.entity';

@Entity('modifier_groups')
export class ModifierGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  menuItemId: string;

  @ManyToOne(() => MenuItem, (m) => m.modifierGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column()
  name: string;

  @Column({ default: 0 })
  minSelect: number;

  @Column({ default: 1 })
  maxSelect: number;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @OneToMany(() => Modifier, (m) => m.group, { cascade: true })
  modifiers: Modifier[];
}
