import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString, Matches, IsInt, Min, ValidateNested } from 'class-validator';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class OrderItemModifierDto {
  @Matches(UUID_RE)
  modifierId: string;
}

export class OrderItemDto {
  @Matches(UUID_RE)
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemModifierDto)
  modifiers?: OrderItemModifierDto[];

  @IsOptional()
  @IsString()
  itemNote?: string;
}

export class PlaceOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  customerNote?: string;
}
