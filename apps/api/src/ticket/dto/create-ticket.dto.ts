import { IsNotEmpty, IsUUID, IsString, IsOptional, IsNumber, Min, IsArray } from 'class-validator';

export class CreateTicketDto {
  @IsUUID('4', { message: 'sessionId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'sessionId không được để trống' })
  sessionId!: string;

  @IsUUID('4', { message: 'seatId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'seatId không được để trống' })
  seatId!: string;

  @IsNumber({}, { message: 'price phải là một số' })
  @Min(0, { message: 'price không được nhỏ hơn 0' })
  @IsNotEmpty({ message: 'price không được để trống' })
  price!: number;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;

  @IsArray({ message: 'orderIds phải là một danh sách' })
  @IsUUID('4', { each: true, message: 'Mỗi orderId trong danh sách phải là định dạng UUID' })
  @IsOptional()
  orderIds?: string[];
}
