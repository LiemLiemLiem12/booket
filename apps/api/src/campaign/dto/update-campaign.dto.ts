import { IsOptional, IsUUID, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { CreateCampaignDto } from './create-campaign.dto';

export class UpdateCampaignDto implements Partial<CreateCampaignDto> {
  @IsUUID('4', { message: 'creatorId phải là định dạng UUID' })
  @IsOptional()
  creatorId?: string;

  @IsString({ message: 'title phải là một chuỗi ký tự' })
  @IsOptional()
  title?: string;

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
  @IsOptional()
  eventType?: string;

  @IsString({ message: 'city phải là một chuỗi ký tự' })
  @IsOptional()
  city?: string;

  @IsString({ message: 'location phải là một chuỗi ký tự' })
  @IsOptional()
  location?: string;

  @IsDateString({}, { message: 'startTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsOptional()
  startTime?: string;

  @IsDateString({}, { message: 'endTime phải là định dạng thời gian hợp lệ (ISO 8601)' })
  @IsOptional()
  endTime?: string;

  @IsString({ message: 'status phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;

  @IsInt({ message: 'maxSeatsPerOrder phải là một số nguyên' })
  @Min(1, { message: 'maxSeatsPerOrder tối thiểu là 1' })
  @IsOptional()
  maxSeatsPerOrder?: number;
}
