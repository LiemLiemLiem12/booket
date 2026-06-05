import { IsOptional, IsUUID, IsString } from 'class-validator';
import { CreateSeatDto } from './create-seat.dto';

export class UpdateSeatDto implements Partial<CreateSeatDto> {
  @IsUUID('4', { message: 'campaignId phải là định dạng UUID' })
  @IsOptional()
  campaignId?: string;

  @IsString({ message: 'areaName phải là một chuỗi ký tự' })
  @IsOptional()
  areaName?: string;

  @IsString({ message: 'rowName phải là một chuỗi ký tự' })
  @IsOptional()
  rowName?: string;

  @IsString({ message: 'colName phải là một chuỗi ký tự' })
  @IsOptional()
  colName?: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;
}
