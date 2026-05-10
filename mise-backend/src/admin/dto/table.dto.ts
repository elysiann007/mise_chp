import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTableDto {
  @IsString()
  @IsNotEmpty()
  label: string;
}

export class UpdateTableDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
