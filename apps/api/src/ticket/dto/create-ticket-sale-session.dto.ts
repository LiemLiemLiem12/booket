import { IsNotEmpty, IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTicketSaleSessionDto {
  @IsUUID('4', { message: 'campaignId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'campaignId không được để trống' })
  campaignId!: string;

  @IsString({ message: 'name phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'name không được để trống' })
  name!: string;

  @IsDateString({}, { message: 'startTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'startTime không được để trống' })
  startTime!: string;

  @IsDateString({}, { message: 'endTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'endTime không được để trống' })
  endTime!: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;
}
