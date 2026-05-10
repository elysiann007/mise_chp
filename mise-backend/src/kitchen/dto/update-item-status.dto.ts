import { IsEnum } from 'class-validator';
import { OrderItemStatus } from '../../shared/enums/order-status.enum';

export class UpdateItemStatusDto {
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;
}
