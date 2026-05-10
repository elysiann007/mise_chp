import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Table } from '../database/entities/table.entity';
import { TableSession } from '../database/entities/table-session.entity';
import { MenuCategory } from '../database/entities/menu-category.entity';
import { BusinessException } from '../common/exceptions/business.exception';
import { SessionStatus } from '../shared/enums/session-status.enum';
import { SESSION_TTL_MS } from '../shared/constants/tax-rates.constant';
import { OpenSessionDto } from './dto/open-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepo: Repository<Table>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
    @InjectRepository(MenuCategory)
    private readonly categoryRepo: Repository<MenuCategory>,
  ) {}

  async openSession(dto: OpenSessionDto) {
    const table = await this.tableRepo.findOne({
      where: { qrToken: dto.qrToken, isActive: true },
      relations: ['restaurant'],
    });

    if (!table) {
      throw new BusinessException('INVALID_QR_TOKEN', HttpStatus.NOT_FOUND, 'QR kodu geçersiz veya devre dışı.');
    }

    // Reuse existing active session for this table if one exists
    const existing = await this.sessionRepo.findOne({
      where: { tableId: table.id, status: SessionStatus.ACTIVE },
    });

    if (existing && !this.isSessionExpired(existing)) {
      const menu = await this.getMenu(table.restaurantId);
      return { sessionToken: existing.sessionToken, table, menu };
    }

    // Close expired session if found
    if (existing) {
      existing.status = SessionStatus.ABANDONED;
      existing.closedAt = new Date();
      await this.sessionRepo.save(existing);
    }

    const session = this.sessionRepo.create({
      tableId: table.id,
      sessionToken: uuidv4(),
      status: SessionStatus.ACTIVE,
    });

    await this.sessionRepo.save(session);
    const menu = await this.getMenu(table.restaurantId);

    return { sessionToken: session.sessionToken, table, menu };
  }

  async getByToken(sessionToken: string) {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken },
      relations: ['table', 'table.restaurant', 'orders', 'orders.items', 'orders.items.modifiers'],
    });

    if (!session) {
      throw new BusinessException('SESSION_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (this.isSessionExpired(session)) {
      throw new BusinessException('SESSION_EXPIRED', HttpStatus.GONE, 'Oturumunuz sona erdi, lütfen tekrar QR okutun.');
    }

    return session;
  }

  async validateSession(sessionToken: string): Promise<TableSession> {
    const session = await this.sessionRepo.findOne({
      where: { sessionToken, status: SessionStatus.ACTIVE },
      relations: ['table'],
    });

    if (!session) {
      throw new BusinessException('SESSION_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    if (this.isSessionExpired(session)) {
      throw new BusinessException('SESSION_EXPIRED', HttpStatus.GONE);
    }

    return session;
  }

  private isSessionExpired(session: TableSession): boolean {
    return new Date() > new Date(session.openedAt.getTime() + SESSION_TTL_MS);
  }

  private async getMenu(restaurantId: string) {
    return this.categoryRepo
      .createQueryBuilder('cat')
      .leftJoinAndSelect('cat.items', 'item', 'item.isActive = true AND item.restaurantId = cat.restaurantId')
      .leftJoinAndSelect('item.modifierGroups', 'mg')
      .leftJoinAndSelect('mg.modifiers', 'mod')
      .where('cat.restaurantId = :restaurantId AND cat.isActive = true', { restaurantId })
      .orderBy('cat.sortOrder', 'ASC')
      .getMany();
  }
}
