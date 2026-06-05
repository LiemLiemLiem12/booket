import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateSeatDto {
  @IsUUID('4', { message: 'campaignId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'campaignId không được để trống' })
  campaignId!: string;

  @IsString({ message: 'areaName phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'areaName không được để trống' })
  areaName!: string;

  @IsString({ message: 'rowName phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'rowName không được để trống' })
  rowName!: string;

  @IsString({ message: 'colName phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'colName không được để trống' })
  colName!: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;
}
