import { IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID('4', { message: 'orderId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'orderId không được để trống' })
  orderId!: string;

  @IsString({ message: 'paymentGateway phải là một chuỗi' })
  @IsNotEmpty({ message: 'paymentGateway không được để trống' })
  paymentGateway!: string;
}
