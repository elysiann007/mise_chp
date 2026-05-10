import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Restaurant } from './entities/restaurant.entity';
import { Table } from './entities/table.entity';
import { TableSession } from './entities/table-session.entity';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { ModifierGroup } from './entities/modifier-group.entity';
import { Modifier } from './entities/modifier.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemModifier } from './entities/order-item-modifier.entity';
import { OrderEvent } from './entities/order-event.entity';
import { User } from './entities/user.entity';

export const ENTITIES = [
  Restaurant,
  Table,
  TableSession,
  MenuCategory,
  MenuItem,
  ModifierGroup,
  Modifier,
  Order,
  OrderItem,
  OrderItemModifier,
  OrderEvent,
  User,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: ENTITIES,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
        namingStrategy: new SnakeNamingStrategy(),
        ssl: config.get<string>('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
