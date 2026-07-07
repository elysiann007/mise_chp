import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../shared/enums/user-role.enum';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateMenuItemDto, UpdateMenuItemDto } from './dto/menu-item.dto';
import {
  CreateModifierGroupDto,
  UpdateModifierGroupDto,
  CreateModifierDto,
  UpdateModifierDto,
} from './dto/modifier.dto';
import { CreateTableDto, UpdateTableDto } from './dto/table.dto';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Dashboard
  @Get('dashboard')
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.adminService.getDashboard(user.restaurantId);
  }

  // Categories
  @Get('categories')
  getCategories(@CurrentUser() user: JwtPayload) {
    return this.adminService.getCategories(user.restaurantId);
  }

  @Post('categories')
  createCategory(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.adminService.createCategory(user.restaurantId, dto);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, user.restaurantId, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteCategory(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.deleteCategory(id, user.restaurantId);
  }

  // Menu Items
  @Get('menu-items')
  getMenuItems(@CurrentUser() user: JwtPayload) {
    return this.adminService.getMenuItems(user.restaurantId);
  }

  @Post('menu-items')
  createMenuItem(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMenuItemDto,
  ) {
    return this.adminService.createMenuItem(user.restaurantId, dto);
  }

  @Patch('menu-items/:id')
  updateMenuItem(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.adminService.updateMenuItem(id, user.restaurantId, dto);
  }

  @Delete('menu-items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMenuItem(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.deleteMenuItem(id, user.restaurantId);
  }

  // Modifier Groups
  @Post('menu-items/:itemId/modifier-groups')
  createModifierGroup(
    @Param('itemId') itemId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateModifierGroupDto,
  ) {
    return this.adminService.createModifierGroup(
      itemId,
      user.restaurantId,
      dto,
    );
  }

  @Patch('modifier-groups/:id')
  updateModifierGroup(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateModifierGroupDto,
  ) {
    return this.adminService.updateModifierGroup(id, user.restaurantId, dto);
  }

  @Delete('modifier-groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteModifierGroup(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminService.deleteModifierGroup(id, user.restaurantId);
  }

  // Modifiers
  @Post('modifier-groups/:groupId/modifiers')
  createModifier(
    @Param('groupId') groupId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateModifierDto,
  ) {
    return this.adminService.createModifier(groupId, user.restaurantId, dto);
  }

  @Patch('modifiers/:id')
  updateModifier(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateModifierDto,
  ) {
    return this.adminService.updateModifier(id, user.restaurantId, dto);
  }

  @Delete('modifiers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteModifier(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.deleteModifier(id, user.restaurantId);
  }

  // Tables
  @Get('tables')
  getTables(@CurrentUser() user: JwtPayload) {
    return this.adminService.getTables(user.restaurantId);
  }

  @Post('tables')
  createTable(@CurrentUser() user: JwtPayload, @Body() dto: CreateTableDto) {
    return this.adminService.createTable(user.restaurantId, dto);
  }

  @Patch('tables/:id')
  updateTable(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateTableDto,
  ) {
    return this.adminService.updateTable(id, user.restaurantId, dto);
  }

  @Delete('tables/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTable(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.deleteTable(id, user.restaurantId);
  }
}
