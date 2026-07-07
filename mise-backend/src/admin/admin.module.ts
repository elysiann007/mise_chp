import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Restaurant } from '../database/entities/restaurant.entity';
import { Table } from '../database/entities/table.entity';
import { TableSession } from '../database/entities/table-session.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { ModifierGroup } from '../database/entities/modifier-group.entity';
import { Modifier } from '../database/entities/modifier.entity';
import { Order } from '../database/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Restaurant,
      Table,
      TableSession,
      MenuCategory,
      MenuItem,
      ModifierGroup,
      Modifier,
      Order,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
