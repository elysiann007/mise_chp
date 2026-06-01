import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateModifierGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minSelect?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxSelect?: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateModifierGroupDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  minSelect?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxSelect?: number;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateModifierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @IsOptional()
  priceDelta?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateModifierDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(-10000)
  @Max(10000)
  @IsOptional()
  priceDelta?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
