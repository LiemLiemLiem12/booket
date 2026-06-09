import { IsNotEmpty, IsUUID, IsString, IsOptional, IsDateString, IsInt, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsUUID('4', { message: 'creatorId phải là định dạng UUID' })
  @IsNotEmpty({ message: 'creatorId không được để trống' })
  creatorId!: string;

  @IsString({ message: 'title phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'title không được để trống' })
  title!: string;

  @IsString({ message: 'description phải là một chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'bannerUrl phải là một chuỗi ký tự' })
  @IsOptional()
  bannerUrl?: string;

  @IsString({ message: 'avatarUrl phải là một chuỗi ký tự' })
  @IsOptional()
  avatarUrl?: string;

  @IsString({ message: 'eventType phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'eventType không được để trống' })
  eventType!: string;

  @IsString({ message: 'city phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'city không được để trống' })
  city!: string;

  @IsString({ message: 'location phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'location không được để trống' })
  location!: string;

  @IsDateString({}, { message: 'startTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'startTime không được để trống' })
  startTime!: string;

  @IsDateString({}, { message: 'endTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'endTime không được để trống' })
  endTime!: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;

  @IsInt({ message: 'maxSeatsPerOrder phải là một số nguyên' })
  @Min(1, { message: 'maxSeatsPerOrder tối thiểu là 1' })
  @IsOptional()
  maxSeatsPerOrder?: number;
}
