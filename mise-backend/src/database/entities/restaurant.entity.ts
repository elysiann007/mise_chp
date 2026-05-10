import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Table } from './table.entity';
import { MenuItem } from './menu-item.entity';
import { MenuCategory } from './menu-category.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 10, unique: true })
  vkn: string;

  @Column()
  taxOffice: string;

  @Column()
  address: string;

  @Column({ default: 'TRY' })
  currency: string;

  @Column({ default: 'tr-TR' })
  locale: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Table, (t) => t.restaurant)
  tables: Table[];

  @OneToMany(() => MenuCategory, (c) => c.restaurant)
  categories: MenuCategory[];

  @OneToMany(() => MenuItem, (m) => m.restaurant)
  menuItems: MenuItem[];
}
