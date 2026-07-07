import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { MenuCategory } from './menu-category.entity';
import { ModifierGroup } from './modifier-group.entity';
import { PrepStation } from '../../shared/enums/prep-station.enum';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  restaurantId: string;

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => Restaurant, (r) => r.menuItems)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => MenuCategory, (c) => c.items)
  @JoinColumn({ name: 'category_id' })
  category: MenuCategory;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('numeric', { precision: 10, scale: 2 })
  basePrice: number;

  @Column('numeric', { precision: 4, scale: 2, default: 0.1 })
  kdzRate: number;

  @Column('numeric', { precision: 4, scale: 2, default: 0 })
  otvRate: number;

  @Column({ type: 'enum', enum: PrepStation, default: PrepStation.KITCHEN })
  prepStation: PrepStation;

  @Column({ default: false })
  isAlcohol: boolean;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ModifierGroup, (g) => g.menuItem, { cascade: true })
  modifierGroups: ModifierGroup[];
}
