import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Min,
} from 'class-validator';
import { PrepStation } from '../../shared/enums/prep-station.enum';

export class CreateMenuItemDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @IsOptional()
  kdzRate?: number;

  @IsNumber()
  @IsOptional()
  otvRate?: number;

  @IsEnum(PrepStation)
  @IsOptional()
  prepStation?: PrepStation;

  @IsBoolean()
  @IsOptional()
  isAlcohol?: boolean;

  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  @IsOptional()
  imageUrl?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateMenuItemDto {
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  basePrice?: number;

  @IsNumber()
  @IsOptional()
  kdzRate?: number;

  @IsNumber()
  @IsOptional()
  otvRate?: number;

  @IsEnum(PrepStation)
  @IsOptional()
  prepStation?: PrepStation;

  @IsBoolean()
  @IsOptional()
  isAlcohol?: boolean;

  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
