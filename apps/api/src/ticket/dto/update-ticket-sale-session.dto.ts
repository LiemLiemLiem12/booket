import { IsOptional, IsUUID, IsString, IsDateString } from 'class-validator';
import { CreateTicketSaleSessionDto } from './create-ticket-sale-session.dto';

export class UpdateTicketSaleSessionDto implements Partial<CreateTicketSaleSessionDto> {
  @IsUUID('4', { message: 'campaignId phải là định dạng UUID' })
  @IsOptional()
  campaignId?: string;

  @IsString({ message: 'name phải là một chuỗi ký tự' })
  @IsOptional()
  name?: string;

  @IsDateString({}, { message: 'startTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsOptional()
  startTime?: string;

  @IsDateString({}, { message: 'endTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsOptional()
  endTime?: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;
}
