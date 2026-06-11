import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsDateString,
  Max,
  IsEnum,
} from 'class-validator';
import PaymentGateway from '../enums/payment-gateway.enum';
import OrderStatus from '../enums/order-status.enum';

export class CreateOrderDto {
  @IsUUID('4', { message: 'buyerId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'buyerId không được để trống' })
  buyerId!: string;

  @IsUUID('4', { message: 'campaignId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'campaignId không được để trống' })
  campaignId!: string;

  @IsUUID('4', { message: 'sessionId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'sessionId không được để trống' })
  sessionId!: string;

  @IsNumber({}, { message: 'totalPrice phải là một số' })
  @Min(0, { message: 'totalPrice không được nhỏ hơn 0' })
  @Max(999999999, { message: 'totalPrice không được lớn hơn 999,999,999' })
  @IsNotEmpty({ message: 'totalPrice không được để trống' })
  totalPrice!: number;

  @IsEnum(OrderStatus, {
    message: 'status phải là một trong các giá trị hợp lệ',
  })
  @IsOptional()
  status?: string;

  @IsEnum(PaymentGateway, {
    message: 'paymentGateway phải là một trong các giá trị hợp lệ',
  })
  @IsNotEmpty()
  paymentGateway: string;

  @IsDateString(
    {},
    { message: 'expiresAt phải là định dạng thời gian hợp lệ (ISO 8601)' },
  )
  @IsOptional()
  expiresAt?: string;

  @IsArray({ message: 'ticketIds phải là một danh sách' })
  @IsUUID('4', {
    each: true,
    message: 'Mỗi ticketId trong danh sách phải là định dạng UUID',
  })
  @IsNotEmpty({ message: 'ticketIds không được để trống' })
  ticketIds!: string[];
}
