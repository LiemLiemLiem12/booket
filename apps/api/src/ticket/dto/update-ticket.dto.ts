import { IsOptional, IsUUID, IsString, IsNumber, Min, IsArray } from 'class-validator';
import { CreateTicketDto } from './create-ticket.dto';

export class UpdateTicketDto implements Partial<CreateTicketDto> {
  @IsUUID('4', { message: 'sessionId phải là định dạng UUID' })
  @IsOptional()
  sessionId?: string;

  @IsUUID('4', { message: 'seatId phải là định dạng UUID' })
  @IsOptional()
  seatId?: string;

  @IsNumber({}, { message: 'price phải là một số' })
  @Min(0, { message: 'price không được nhỏ hơn 0' })
  @IsOptional()
  price?: number;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;

  @IsArray({ message: 'orderIds phải là một danh sách' })
  @IsUUID('4', { each: true, message: 'Mỗi orderId trong danh sách phải là định dạng UUID' })
  @IsOptional()
  orderIds?: string[];
}
