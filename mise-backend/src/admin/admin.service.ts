import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../database/entities/restaurant.entity';
import { Table } from '../database/entities/table.entity';
import { TableSession } from '../database/entities/table-session.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { MenuItem } from '../database/entities/menu-item.entity';
import { ModifierGroup } from '../database/entities/modifier-group.entity';
import { Modifier } from '../database/entities/modifier.entity';
import { Order } from '../database/entities/order.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { SessionStatus } from '../shared/enums/session-status.enum';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import type { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import type { CreateModifierGroupDto, UpdateModifierGroupDto, CreateModifierDto, UpdateModifierDto } from './dto/modifier.dto';
import type { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Restaurant) private restaurantRepo: Repository<Restaurant>,
    @InjectRepository(Table) private tableRepo: Repository<Table>,
    @InjectRepository(TableSession) private sessionRepo: Repository<TableSession>,
    @InjectRepository(MenuCategory) private categoryRepo: Repository<MenuCategory>,
    @InjectRepository(MenuItem) private itemRepo: Repository<MenuItem>,
    @InjectRepository(ModifierGroup) private groupRepo: Repository<ModifierGroup>,
    @InjectRepository(Modifier) private modifierRepo: Repository<Modifier>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────

  async getDashboard(restaurantId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [activeSessions, ordersToday, restaurant] = await Promise.all([
      this.sessionRepo
        .createQueryBuilder('s')
        .innerJoin('s.table', 't')
        .where('t.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('s.status = :status', { status: SessionStatus.ACTIVE })
        .getCount(),
      this.orderRepo
        .createQueryBuilder('o')
        .innerJoin('o.session', 's')
        .innerJoin('s.table', 't')
        .where('t.restaurant_id = :restaurantId', { restaurantId })
        .andWhere('o.placed_at >= :todayStart', { todayStart })
        .getCount(),
      this.restaurantRepo.findOne({ where: { id: restaurantId } }),
    ]);

    return { activeSessions, ordersToday, restaurant };
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  getCategories(restaurantId: string) {
    return this.categoryRepo.find({
      where: { restaurantId },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async createCategory(restaurantId: string, dto: CreateCategoryDto) {
    return this.categoryRepo.save(
      this.categoryRepo.create({ ...dto, restaurantId, sortOrder: dto.sortOrder ?? 0 }),
    );
  }

  async updateCategory(id: string, restaurantId: string, dto: UpdateCategoryDto) {
    await this.assertOwned(this.categoryRepo, id, restaurantId);
    await this.categoryRepo.update(id, dto);
    return this.categoryRepo.findOneBy({ id });
  }

  async deleteCategory(id: string, restaurantId: string) {
    await this.assertOwned(this.categoryRepo, id, restaurantId);
    await this.categoryRepo.update(id, { isActive: false });
    await this.itemRepo.update({ categoryId: id }, { isActive: false });
  }

  // ── Menu Items ─────────────────────────────────────────────────────────────

  getMenuItems(restaurantId: string) {
    return this.itemRepo.find({
      where: { restaurantId },
      relations: ['modifierGroups', 'modifierGroups.modifiers'],
      order: { sortOrder: 'ASC' },
    });
  }

  async createMenuItem(restaurantId: string, dto: CreateMenuItemDto) {
    await this.assertOwned(this.categoryRepo, dto.categoryId, restaurantId);
    return this.itemRepo.save(
      this.itemRepo.create({
        ...dto,
        restaurantId,
        kdzRate: dto.kdzRate ?? 0.1,
        otvRate: dto.otvRate ?? 0,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
  }

  async updateMenuItem(id: string, restaurantId: string, dto: UpdateMenuItemDto) {
    await this.assertOwned(this.itemRepo, id, restaurantId);
    if (dto.categoryId) await this.assertOwned(this.categoryRepo, dto.categoryId, restaurantId);
    await this.itemRepo.update(id, dto);
    return this.itemRepo.findOne({ where: { id }, relations: ['modifierGroups', 'modifierGroups.modifiers'] });
  }

  async deleteMenuItem(id: string, restaurantId: string) {
    await this.assertOwned(this.itemRepo, id, restaurantId);
    await this.itemRepo.update(id, { isActive: false });
  }

  // ── Modifier Groups ────────────────────────────────────────────────────────

  async createModifierGroup(menuItemId: string, restaurantId: string, dto: CreateModifierGroupDto) {
    await this.assertOwned(this.itemRepo, menuItemId, restaurantId);
    return this.groupRepo.save(
      this.groupRepo.create({ ...dto, menuItemId, minSelect: dto.minSelect ?? 0, maxSelect: dto.maxSelect ?? 1 }),
    );
  }

  async updateModifierGroup(id: string, restaurantId: string, dto: UpdateModifierGroupDto) {
    await this.assertGroupOwned(id, restaurantId);
    await this.groupRepo.update(id, dto);
    return this.groupRepo.findOne({ where: { id }, relations: ['modifiers'] });
  }

  async deleteModifierGroup(id: string, restaurantId: string) {
    await this.assertGroupOwned(id, restaurantId);
    await this.groupRepo.delete(id);
  }

  // ── Modifiers ──────────────────────────────────────────────────────────────

  async createModifier(groupId: string, restaurantId: string, dto: CreateModifierDto) {
    await this.assertGroupOwned(groupId, restaurantId);
    return this.modifierRepo.save(
      this.modifierRepo.create({ ...dto, groupId, priceDelta: dto.priceDelta ?? 0 }),
    );
  }

  async updateModifier(id: string, restaurantId: string, dto: UpdateModifierDto) {
    await this.assertModifierOwned(id, restaurantId);
    await this.modifierRepo.update(id, dto);
    return this.modifierRepo.findOneBy({ id });
  }

  async deleteModifier(id: string, restaurantId: string) {
    await this.assertModifierOwned(id, restaurantId);
    await this.modifierRepo.delete(id);
  }

  // ── Tables ─────────────────────────────────────────────────────────────────

  getTables(restaurantId: string) {
    return this.tableRepo.find({ where: { restaurantId }, order: { label: 'ASC' } });
  }

  createTable(restaurantId: string, dto: CreateTableDto) {
    return this.tableRepo.save(
      this.tableRepo.create({ ...dto, restaurantId, qrToken: uuidv4() }),
    );
  }

  async updateTable(id: string, restaurantId: string, dto: UpdateTableDto) {
    await this.assertOwned(this.tableRepo, id, restaurantId);
    await this.tableRepo.update(id, dto);
    return this.tableRepo.findOneBy({ id });
  }

  async deleteTable(id: string, restaurantId: string) {
    await this.assertOwned(this.tableRepo, id, restaurantId);
    await this.tableRepo.update(id, { isActive: false });
  }

  // ── Ownership guards ───────────────────────────────────────────────────────

  private async assertOwned(repo: Repository<any>, id: string, restaurantId: string) {
    const entity = await repo.findOneBy({ id });
    if (!entity || entity.restaurantId !== restaurantId) {
      throw new BusinessException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return entity;
  }

  private async assertGroupOwned(groupId: string, restaurantId: string) {
    const group = await this.groupRepo.findOne({
      where: { id: groupId },
      relations: ['menuItem'],
    });
    if (!group || group.menuItem.restaurantId !== restaurantId) {
      throw new BusinessException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return group;
  }

  private async assertModifierOwned(modifierId: string, restaurantId: string) {
    const mod = await this.modifierRepo.findOne({
      where: { id: modifierId },
      relations: ['group', 'group.menuItem'],
    });
    if (!mod || mod.group.menuItem.restaurantId !== restaurantId) {
      throw new BusinessException('NOT_FOUND', HttpStatus.NOT_FOUND);
    }
    return mod;
  }
}
